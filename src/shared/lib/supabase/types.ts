export type BaseType = 'base_blanca' | 'base_holografica'
export type ProductType = 'calco' | 'jarro' | 'iman'
export type StickerStatus = 'active' | 'draft' | 'archived'

export interface Database {
  public: {
    Tables: {
      stickers: {
        Row: {
          id: string
          model_number: string
          name_es: string
          name_en: string
          description_es: string | null
          description_en: string | null
          slug: string
          base_type: BaseType | null
          product_type: ProductType
          price_ars: number
          stock: number
          image_url: string | null
          image_path: string | null
          status: StickerStatus
          is_featured: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          model_number: string
          name_es: string
          name_en: string
          description_es?: string | null
          description_en?: string | null
          slug: string
          base_type?: BaseType | null
          product_type?: ProductType
          price_ars: number
          stock?: number
          image_url?: string | null
          image_path?: string | null
          status?: StickerStatus
          is_featured?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          model_number?: string
          name_es?: string
          name_en?: string
          description_es?: string | null
          description_en?: string | null
          slug?: string
          base_type?: BaseType | null
          product_type?: ProductType
          price_ars?: number
          stock?: number
          image_url?: string | null
          image_path?: string | null
          status?: StickerStatus
          is_featured?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sticker_tags_sticker_id_fkey'
            columns: ['id']
            isOneToOne: false
            referencedRelation: 'sticker_tags'
            referencedColumns: ['sticker_id']
          }
        ]
      }
      tags: {
        Row: {
          id: string
          name_es: string
          name_en: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name_es: string
          name_en: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name_es?: string
          name_en?: string
          slug?: string
          created_at?: string
        }
        Relationships: []
      }
      sticker_tags: {
        Row: {
          sticker_id: string
          tag_id: string
        }
        Insert: {
          sticker_id: string
          tag_id: string
        }
        Update: {
          sticker_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sticker_tags_sticker_id_fkey'
            columns: ['sticker_id']
            isOneToOne: false
            referencedRelation: 'stickers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sticker_tags_tag_id_fkey'
            columns: ['tag_id']
            isOneToOne: false
            referencedRelation: 'tags'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      base_type: BaseType
      product_type: ProductType
      sticker_status: StickerStatus
    }
  }
}

export type Sticker = Database['public']['Tables']['stickers']['Row']
export type StickerInsert = Database['public']['Tables']['stickers']['Insert']
export type StickerUpdate = Database['public']['Tables']['stickers']['Update']
export type Tag = Database['public']['Tables']['tags']['Row']
export type TagInsert = Database['public']['Tables']['tags']['Insert']
export type TagUpdate = Database['public']['Tables']['tags']['Update']

export interface StickerWithTags extends Sticker {
  tags: Tag[]
}
