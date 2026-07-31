import { z } from "zod";
import { gerarHashSenha } from "../utilitarios/senha.js";
import { ErroHttp } from "../middleware/tratadorErros.js";
import {
  listarEquipe,
  obterMembro,
  convidarMembroEquipe,
  atualizarPapelMembro,
  removerMembroEquipe,
} from "../servicos/equipe.servico.js";
import { registrarAuditoria } from "../servicos/auditoria.servico.js";

const PAPEIS = ["DONO", "GERENTE", "PROFISSIONAL", "RECEPCIONISTA"];

const esquemaConvite = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
  papel: z.enum(PAPEIS),
  // Só faz sentido (e só é validado no controlador de MembroEquipe) quando papel = PROFISSIONAL.
  profissionalId: z.string().min(1).optional().nullable(),
});

const esquemaAtualizacao = z.object({
  papel: z.enum(PAPEIS),
  profissionalId: z.string().min(1).optional().nullable(),
});

export async function listar(req, res) {
  const equipe = await listarEquipe(req.salaoId);
  res.json(equipe);
}

export async function convidar(req, res) {
  const dados = esquemaConvite.parse(req.body);
  const senhaHash = await gerarHashSenha(dados.senha);

  const membro = await convidarMembroEquipe({
    salaoId: req.salaoId,
    nome: dados.nome,
    email: dados.email,
    senhaHash,
    papel: dados.papel,
    profissionalId: dados.profissionalId,
  }).catch((err) => {
    if (err.code === "P2002") throw new ErroHttp(409, "Já existe um usuário com esse e-mail.");
    throw err;
  });

  registrarAuditoria({
    usuarioId: req.usuario.sub,
    salaoId: req.salaoId,
    acao: "equipe.convidar",
    entidade: "MembroEquipe",
    entidadeId: membro.id,
    detalhes: { papel: dados.papel },
    ip: req.ip,
  }).catch(() => {});

  res.status(201).json(membro);
}

export async function atualizar(req, res) {
  const dados = esquemaAtualizacao.parse(req.body);
  const membro = await atualizarPapelMembro(req.salaoId, req.params.id, dados);
  if (!membro) throw new ErroHttp(404, "Membro da equipe não encontrado.");

  registrarAuditoria({
    usuarioId: req.usuario.sub,
    salaoId: req.salaoId,
    acao: "equipe.atualizar_papel",
    entidade: "MembroEquipe",
    entidadeId: membro.id,
    detalhes: { papel: dados.papel },
    ip: req.ip,
  }).catch(() => {});

  res.json(membro);
}

export async function remover(req, res) {
  const membro = await obterMembro(req.salaoId, req.params.id);
  if (!membro) throw new ErroHttp(404, "Membro da equipe não encontrado.");
  if (membro.usuarioId === req.usuario.sub) {
    throw new ErroHttp(400, "Você não pode remover a si mesmo da equipe.");
  }

  await removerMembroEquipe(req.salaoId, req.params.id);

  registrarAuditoria({
    usuarioId: req.usuario.sub,
    salaoId: req.salaoId,
    acao: "equipe.remover",
    entidade: "MembroEquipe",
    entidadeId: req.params.id,
    ip: req.ip,
  }).catch(() => {});

  res.status(204).send();
}
