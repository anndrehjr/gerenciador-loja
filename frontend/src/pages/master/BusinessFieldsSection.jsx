import Input from "../../components/ui/Input.jsx";

const CONTRACT_STATUS_OPTIONS = [
  { value: "TRIAL", label: "Teste" },
  { value: "ACTIVE", label: "Ativo" },
  { value: "PAST_DUE", label: "Em atraso" },
  { value: "CANCELED", label: "Cancelado" },
];

export const CONTRACT_STATUS_LABELS = Object.fromEntries(
  CONTRACT_STATUS_OPTIONS.map((opt) => [opt.value, opt.label])
);

// Dados cadastrais/comerciais do dono do salão, usados só no Painel Master —
// compartilhado entre a tela de criação e a de edição de um salão.
export default function BusinessFieldsSection({ form, onChange }) {
  function set(field) {
    return (e) => onChange({ ...form, [field]: e.target.value });
  }

  return (
    <>
      <div className="mt-2 border-t border-line pt-4 text-sm font-medium text-muted">Dados cadastrais</div>

      <div className="grid grid-cols-2 gap-4">
        <Input id="document" label="CPF ou CNPJ" value={form.document} onChange={set("document")} />
        <Input id="legalName" label="Razão Social" value={form.legalName} onChange={set("legalName")} />
      </div>

      <Input id="ownerName" label="Nome do proprietário" value={form.ownerName} onChange={set("ownerName")} />

      <div className="grid grid-cols-2 gap-4">
        <Input id="ownerPhone" label="Telefone" value={form.ownerPhone} onChange={set("ownerPhone")} />
        <Input id="ownerWhatsapp" label="WhatsApp" value={form.ownerWhatsapp} onChange={set("ownerWhatsapp")} />
      </div>

      <Input id="ownerEmail" label="Email do proprietário" type="email" value={form.ownerEmail} onChange={set("ownerEmail")} />
      <Input id="address" label="Endereço" value={form.address} onChange={set("address")} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="contractStatus" className="mb-1.5 block text-sm font-medium text-ink">
            Situação do contrato
          </label>
          <select
            id="contractStatus"
            value={form.contractStatus}
            onChange={set("contractStatus")}
            className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none transition duration-200 focus:border-accent"
          >
            {CONTRACT_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <Input
          id="contractDueDate"
          label="Vencimento"
          type="date"
          value={form.contractDueDate}
          onChange={set("contractDueDate")}
        />
      </div>

      <div>
        <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-ink">
          Observações
        </label>
        <textarea
          id="notes"
          rows={3}
          value={form.notes}
          onChange={set("notes")}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none transition duration-200 focus:border-accent"
        />
      </div>
    </>
  );
}
