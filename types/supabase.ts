export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	public: {
		Tables: {
			customers: {
				Row: {
					id: string;
					stripe_customer_id: string | null;
				};
				Insert: {
					id: string;
					stripe_customer_id?: string | null;
				};
				Update: {
					id?: string;
					stripe_customer_id?: string | null;
				};
				Relationships: [];
			};
			discord_connections: {
				Row: {
					created_at: string;
					discord_user_id: string;
					discord_username: string;
					id: string;
					updated_at: string;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					discord_user_id: string;
					discord_username: string;
					id?: string;
					updated_at?: string;
					user_id: string;
				};
				Update: {
					created_at?: string;
					discord_user_id?: string;
					discord_username?: string;
					id?: string;
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [];
			};
			prices: {
				Row: {
					active: boolean | null;
					currency: string | null;
					description: string | null;
					id: string;
					interval: Database["public"]["Enums"]["pricing_plan_interval"] | null;
					interval_count: number | null;
					metadata: Json | null;
					product_id: string | null;
					trial_period_days: number | null;
					type: Database["public"]["Enums"]["pricing_type"] | null;
					unit_amount: number | null;
				};
				Insert: {
					active?: boolean | null;
					currency?: string | null;
					description?: string | null;
					id: string;
					interval?:
						| Database["public"]["Enums"]["pricing_plan_interval"]
						| null;
					interval_count?: number | null;
					metadata?: Json | null;
					product_id?: string | null;
					trial_period_days?: number | null;
					type?: Database["public"]["Enums"]["pricing_type"] | null;
					unit_amount?: number | null;
				};
				Update: {
					active?: boolean | null;
					currency?: string | null;
					description?: string | null;
					id?: string;
					interval?:
						| Database["public"]["Enums"]["pricing_plan_interval"]
						| null;
					interval_count?: number | null;
					metadata?: Json | null;
					product_id?: string | null;
					trial_period_days?: number | null;
					type?: Database["public"]["Enums"]["pricing_type"] | null;
					unit_amount?: number | null;
				};
				Relationships: [];
			};
			products: {
				Row: {
					active: boolean | null;
					description: string | null;
					id: string;
					image: string | null;
					metadata: Json | null;
					name: string | null;
				};
				Insert: {
					active?: boolean | null;
					description?: string | null;
					id: string;
					image?: string | null;
					metadata?: Json | null;
					name?: string | null;
				};
				Update: {
					active?: boolean | null;
					description?: string | null;
					id?: string;
					image?: string | null;
					metadata?: Json | null;
					name?: string | null;
				};
				Relationships: [];
			};
			signals: {
				Row: {
					boxes: Json;
					created_at: string | null;
					end_price: number | null;
					end_time: string | null;
					id: string;
					pair: string;
					pattern_info: Json | null;
					pattern_type: string;
					start_price: number | null;
					start_time: string;
					status: string;
					stop_loss: number | null;
					take_profit: number | null;
					user_id: string | null;
				};
				Insert: {
					boxes: Json;
					created_at?: string | null;
					end_price?: number | null;
					end_time?: string | null;
					id?: string;
					pair: string;
					pattern_info?: Json | null;
					pattern_type: string;
					start_price?: number | null;
					start_time?: string;
					status?: string;
					stop_loss?: number | null;
					take_profit?: number | null;
					user_id?: string | null;
				};
				Update: {
					boxes?: Json;
					created_at?: string | null;
					end_price?: number | null;
					end_time?: string | null;
					id?: string;
					pair?: string;
					pattern_info?: Json | null;
					pattern_type?: string;
					start_price?: number | null;
					start_time?: string;
					status?: string;
					stop_loss?: number | null;
					take_profit?: number | null;
					user_id?: string | null;
				};
				Relationships: [];
			};
			subscriptions: {
				Row: {
					cancel_at: string | null;
					cancel_at_period_end: boolean | null;
					canceled_at: string | null;
					created: string;
					current_period_end: string;
					current_period_start: string;
					ended_at: string | null;
					id: string;
					metadata: Json | null;
					price_id: string | null;
					quantity: number | null;
					status: Database["public"]["Enums"]["subscription_status"] | null;
					trial_end: string | null;
					trial_start: string | null;
					user_id: string;
				};
				Insert: {
					cancel_at?: string | null;
					cancel_at_period_end?: boolean | null;
					canceled_at?: string | null;
					created?: string;
					current_period_end?: string;
					current_period_start?: string;
					ended_at?: string | null;
					id: string;
					metadata?: Json | null;
					price_id?: string | null;
					quantity?: number | null;
					status?: Database["public"]["Enums"]["subscription_status"] | null;
					trial_end?: string | null;
					trial_start?: string | null;
					user_id: string;
				};
				Update: {
					cancel_at?: string | null;
					cancel_at_period_end?: boolean | null;
					canceled_at?: string | null;
					created?: string;
					current_period_end?: string;
					current_period_start?: string;
					ended_at?: string | null;
					id?: string;
					metadata?: Json | null;
					price_id?: string | null;
					quantity?: number | null;
					status?: Database["public"]["Enums"]["subscription_status"] | null;
					trial_end?: string | null;
					trial_start?: string | null;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "subscriptions_price_id_fkey";
						columns: ["price_id"];
						isOneToOne: false;
						referencedRelation: "prices";
						referencedColumns: ["id"];
					},
				];
			};
			support_messages: {
				Row: {
					content: string;
					created_at: string | null;
					id: string;
					metadata: Json | null;
					sender_id: string;
					sender_name: string;
					sender_type: string;
					thread_id: string;
				};
				Insert: {
					content: string;
					created_at?: string | null;
					id?: string;
					metadata?: Json | null;
					sender_id: string;
					sender_name: string;
					sender_type: string;
					thread_id: string;
				};
				Update: {
					content?: string;
					created_at?: string | null;
					id?: string;
					metadata?: Json | null;
					sender_id?: string;
					sender_name?: string;
					sender_type?: string;
					thread_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "support_messages_thread_id_fkey";
						columns: ["thread_id"];
						isOneToOne: false;
						referencedRelation: "support_threads";
						referencedColumns: ["id"];
					},
				];
			};
			support_threads: {
				Row: {
					created_at: string | null;
					id: string;
					last_message: string | null;
					last_message_time: string | null;
					metadata: Json | null;
					product_id: string;
					status: Database["public"]["Enums"]["thread_status"] | null;
					subject: string | null;
					updated_at: string | null;
					user_email: string;
					user_id: string;
					user_name: string;
				};
				Insert: {
					created_at?: string | null;
					id?: string;
					last_message?: string | null;
					last_message_time?: string | null;
					metadata?: Json | null;
					product_id: string;
					status?: Database["public"]["Enums"]["thread_status"] | null;
					subject?: string | null;
					updated_at?: string | null;
					user_email: string;
					user_id: string;
					user_name: string;
				};
				Update: {
					created_at?: string | null;
					id?: string;
					last_message?: string | null;
					last_message_time?: string | null;
					metadata?: Json | null;
					product_id?: string;
					status?: Database["public"]["Enums"]["thread_status"] | null;
					subject?: string | null;
					updated_at?: string | null;
					user_email?: string;
					user_id?: string;
					user_name?: string;
				};
				Relationships: [
					{
						foreignKeyName: "support_threads_product_id_fkey";
						columns: ["product_id"];
						isOneToOne: false;
						referencedRelation: "products";
						referencedColumns: ["id"];
					},
				];
			};
			users: {
				Row: {
					avatar_url: string | null;
					billing_address: Json | null;
					full_name: string | null;
					id: string;
					payment_method: Json | null;
					updated_at: string | null;
				};
				Insert: {
					avatar_url?: string | null;
					billing_address?: Json | null;
					full_name?: string | null;
					id: string;
					payment_method?: Json | null;
					updated_at?: string | null;
				};
				Update: {
					avatar_url?: string | null;
					billing_address?: Json | null;
					full_name?: string | null;
					id?: string;
					payment_method?: Json | null;
					updated_at?: string | null;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			pricing_plan_interval: "day" | "week" | "month" | "year";
			pricing_type: "one_time" | "recurring";
			subscription_status:
				| "trialing"
				| "active"
				| "canceled"
				| "incomplete"
				| "incomplete_expired"
				| "past_due"
				| "unpaid";
			thread_status: "open" | "closed" | "pending";
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
	PublicTableNameOrOptions extends
		| keyof (PublicSchema["Tables"] & PublicSchema["Views"])
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
				Database[PublicTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
			Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
				PublicSchema["Views"])
		? (PublicSchema["Tables"] &
				PublicSchema["Views"])[PublicTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	PublicTableNameOrOptions extends
		| keyof PublicSchema["Tables"]
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
		? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	PublicTableNameOrOptions extends
		| keyof PublicSchema["Tables"]
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
		? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	PublicEnumNameOrOptions extends
		| keyof PublicSchema["Enums"]
		| { schema: keyof Database },
	EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
	? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
		? PublicSchema["Enums"][PublicEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof PublicSchema["CompositeTypes"]
		| { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
		? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;
