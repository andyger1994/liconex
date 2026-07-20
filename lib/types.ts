export type Role = "admin" | "technician";

export type Profile = {
  id: string;
  full_name: string | null;
  role: Role;
  email: string | null;
};

export type DashboardMetrics = {
  hoursToday: number;
  pendingJobs: number;
  activeJobs: number;
  finishedJobs: number;
  expensesToday: number;
  paymentsToday: number;
};

export type JobStatus =
  | "nuevo"
  | "presupuestado"
  | "aprobado"
  | "programado"
  | "en_camino"
  | "en_proceso"
  | "pausado"
  | "pendiente_materiales"
  | "pendiente_cliente"
  | "finalizado"
  | "facturado"
  | "cobrado"
  | "cancelado"
  | "en_garantia";

export type MoneyRow = {
  amount: number;
  currency: "UYU" | "USD";
};
