import Input from "../../components/ui/Input.jsx";
import { SALON_TYPES } from "../../lib/salonTypes.js";

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
      <Input id="tradeName" label="Nome Fantasia" value={form.tradeName} onChange={set("tradeName")} />

      <Input id="ownerName" label="Nome do proprietário" value={form.ownerName} onChange={set("ownerName")} />

      <div className="grid grid-cols-2 gap-4">
        <Input id="ownerPhone" label="Telefone" value={form.ownerPhone} onChange={set("ownerPhone")} />
        <Input id="ownerWhatsapp" label="WhatsApp" value={form.ownerWhatsapp} onChange={set("ownerWhatsapp")} />
      </div>

      <Input id="ownerEmail" label="Email do proprietário" type="email" value={form.ownerEmail} onChange={set("ownerEmail")} />
      <Input id="address" label="Endereço" value={form.address} onChange={set("address")} />

      <div className="grid grid-cols-3 gap-4">
        <Input id="city" label="Cidade" value={form.city} onChange={set("city")} />
        <Input id="state" label="Estado" maxLength={2} value={form.state} onChange={set("state")} />
        <Input id="zipCode" label="CEP" value={form.zipCode} onChange={set("zipCode")} />
      </div>

      <div>
        <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-ink">
          Tipo de negócio
        </label>
        <select
          id="category"
          value={form.category}
          onChange={set("category")}
          className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none transition duration-200 focus:border-accent"
        >
          {SALON_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

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
