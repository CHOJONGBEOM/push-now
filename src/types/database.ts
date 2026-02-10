export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            push_messages: {
                Row: {
                    id: number
                    app_name: string
                    package_name: string | null
                    title: string | null
                    body: string | null
                    category: string
                    posted_at: string
                    created_at: string
                    is_hidden: boolean | null
                    is_ad: boolean | null
                    has_emoji: boolean | null
                    message_length: number | null
                    raw_data: string | null
                }
                Insert: {
                    id?: number
                    app_name: string
                    package_name?: string | null
                    title?: string | null
                    body?: string | null
                    category?: string
                    posted_at: string
                    created_at?: string
                    is_hidden?: boolean | null
                    is_ad?: boolean | null
                    has_emoji?: boolean | null
                    message_length?: number | null
                    raw_data?: string | null
                }
                Update: {
                    id?: number
                    app_name?: string
                    package_name?: string | null
                    title?: string | null
                    body?: string | null
                    category?: string
                    posted_at?: string
                    created_at?: string
                    is_hidden?: boolean | null
                    is_ad?: boolean | null
                    has_emoji?: boolean | null
                    message_length?: number | null
                    raw_data?: string | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
