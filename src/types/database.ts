/**
 * Database types for supabase-js.
 *
 * Hand-written to match supabase/migrations. Once the project is linked,
 * regenerate it from the live schema with `npm run db:types`.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type ServiceIcon = "globe" | "cart" | "bot" | "code" | "chart";
type PackageTier = "starter" | "growth" | "scale";
type BookingStatus = "pending_payment" | "confirmed" | "cancelled" | "expired";
type PaymentStatus = "pending" | "paid" | "failed" | "expired" | "refunded";

type ServicesRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: ServiceIcon;
  ideal_for: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type ServicePackagesRow = {
  id: string;
  service_id: string;
  slug: string;
  tier: PackageTier;
  name: string;
  summary: string;
  price_cents: number;
  deposit_cents: number;
  currency: string;
  timeline_weeks_min: number;
  timeline_weeks_max: number;
  deliverables: string[];
  is_popular: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type SchedulingSettingsRow = {
  id: boolean;
  timezone: string;
  slot_duration_minutes: number;
  buffer_minutes: number;
  min_notice_hours: number;
  max_days_ahead: number;
  hold_minutes: number;
  updated_at: string;
};

type AvailabilityRulesRow = {
  id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
};

type AvailabilityExceptionsRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
  created_at: string;
};

type CustomersRow = {
  id: string;
  email: string;
  full_name: string;
  company: string | null;
  created_at: string;
  updated_at: string;
};

type AdvisorRecommendationsRow = {
  id: string;
  package_id: string | null;
  problem_summary: string;
  response: Json;
  model: string;
  created_at: string;
};

type BookingsRow = {
  id: string;
  customer_id: string;
  package_id: string;
  recommendation_id: string | null;
  starts_at: string | null;
  ends_at: string | null;
  status: BookingStatus;
  deposit_cents: number;
  currency: string;
  project_notes: string | null;
  expires_at: string;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
};

type PaymentsRow = {
  id: string;
  booking_id: string;
  stripe_checkout_session_id: string;
  stripe_payment_intent_id: string | null;
  stripe_checkout_url: string | null;
  amount_cents: number;
  currency: string;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

type StripeEventsRow = {
  id: string;
  type: string;
  payload: Json;
  processed_at: string;
};

type AdvisorUsageRow = {
  bucket: string;
  used: number;
  expires_at: string;
};

/** Columns with a database default become optional on insert. */
type WithDefaults<Row, DefaultKeys extends keyof Row> = Omit<Row, DefaultKeys> & Partial<Pick<Row, DefaultKeys>>;

type TableDef<Row, Insert, Relationships extends unknown[] = []> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Insert>;
  Relationships: Relationships;
};

export type Database = {
  public: {
    Tables: {
      services: TableDef<
        ServicesRow,
        WithDefaults<ServicesRow, "id" | "sort_order" | "is_active" | "created_at" | "updated_at">
      >;
      service_packages: TableDef<
        ServicePackagesRow,
        WithDefaults<
          ServicePackagesRow,
          "id" | "currency" | "deliverables" | "is_popular" | "sort_order" | "is_active" | "created_at" | "updated_at"
        >,
        [
          {
            foreignKeyName: "service_packages_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ]
      >;
      scheduling_settings: TableDef<SchedulingSettingsRow, Partial<SchedulingSettingsRow>>;
      availability_rules: TableDef<
        AvailabilityRulesRow,
        WithDefaults<AvailabilityRulesRow, "id" | "is_active" | "created_at">
      >;
      availability_exceptions: TableDef<
        AvailabilityExceptionsRow,
        WithDefaults<AvailabilityExceptionsRow, "id" | "reason" | "created_at">
      >;
      customers: TableDef<
        CustomersRow,
        WithDefaults<CustomersRow, "id" | "company" | "created_at" | "updated_at">
      >;
      advisor_recommendations: TableDef<
        AdvisorRecommendationsRow,
        WithDefaults<AdvisorRecommendationsRow, "id" | "package_id" | "created_at">,
        [
          {
            foreignKeyName: "advisor_recommendations_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "service_packages";
            referencedColumns: ["id"];
          },
        ]
      >;
      bookings: TableDef<
        BookingsRow,
        WithDefaults<
          BookingsRow,
          | "id"
          | "recommendation_id"
          | "starts_at"
          | "ends_at"
          | "status"
          | "project_notes"
          | "confirmed_at"
          | "created_at"
          | "updated_at"
        >,
        [
          {
            foreignKeyName: "bookings_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "service_packages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_recommendation_id_fkey";
            columns: ["recommendation_id"];
            isOneToOne: false;
            referencedRelation: "advisor_recommendations";
            referencedColumns: ["id"];
          },
        ]
      >;
      payments: TableDef<
        PaymentsRow,
        WithDefaults<
          PaymentsRow,
          | "id"
          | "stripe_payment_intent_id"
          | "stripe_checkout_url"
          | "status"
          | "paid_at"
          | "created_at"
          | "updated_at"
        >,
        [
          {
            foreignKeyName: "payments_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ]
      >;
      stripe_events: TableDef<StripeEventsRow, WithDefaults<StripeEventsRow, "processed_at">>;
      advisor_usage: TableDef<AdvisorUsageRow, WithDefaults<AdvisorUsageRow, "used">>;
    };
    Views: { [_ in never]: never };
    Functions: {
      get_available_slots: {
        Args: { p_from: string; p_to: string };
        Returns: { starts_at: string; ends_at: string }[];
      };
      confirm_booking_payment: {
        Args: { p_session_id: string; p_payment_intent_id?: string };
        Returns: string;
      };
      expire_checkout_session: {
        Args: { p_session_id: string };
        Returns: string;
      };
      consume_advisor_quota: {
        Args: { p_daily_limit: number; p_window_limit: number; p_window_seconds: number };
        Returns: number;
      };
      create_booking_hold: {
        Args: {
          p_package_slug: string;
          p_starts_at: string | null;
          p_email: string;
          p_full_name: string;
          p_company?: string;
          p_project_notes?: string;
          p_recommendation_id?: string;
        };
        Returns: BookingsRow;
      };
    };
    Enums: {
      service_icon: ServiceIcon;
      package_tier: PackageTier;
      booking_status: BookingStatus;
      payment_status: PaymentStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];
