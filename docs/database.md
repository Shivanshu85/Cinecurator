# Database Architecture & Supabase Integration

## 🗄️ Overview

CineCurator uses **Supabase PostgreSQL** for user authentication and persistent bookmark watchlist storage (`user_library`).

---

## 📐 Database Entity Relationship Schema

```text
               auth.users (Supabase Managed Auth)
                           │
                           │ 1 : N
                           ▼
               public.user_library
┌────────────────────────────────────────────────────────┐
│ id           │ UUID         │ PRIMARY KEY              │
│ user_id      │ UUID         │ REFERENCES auth.users    │
│ imdb_id      │ TEXT         │ NOT NULL                 │
│ title        │ TEXT         │ NOT NULL                 │
│ poster       │ TEXT         │ NULLABLE                 │
│ rating       │ TEXT         │ NULLABLE                 │
│ genre        │ TEXT         │ NULLABLE                 │
│ year         │ TEXT         │ NULLABLE                 │
│ created_at   │ TIMESTAMPTZ  │ DEFAULT now()            │
└────────────────────────────────────────────────────────┘
```

---

## 🔒 Row Level Security (RLS) Policies

To ensure multi-tenant data privacy, Row Level Security is enabled on `public.user_library`. Users can only access rows matching their authenticated Supabase User ID (`auth.uid()`):

```sql
-- Enable RLS on user_library table
ALTER TABLE public.user_library ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can read their own saved library items
CREATE POLICY "Users can view their own library items"
ON public.user_library FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Users can insert items into their library
CREATE POLICY "Users can add items to their library"
ON public.user_library FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can delete items from their library
CREATE POLICY "Users can delete items from their library"
ON public.user_library FOR DELETE
USING (auth.uid() = user_id);
```

---

## 🚀 Migration SQL Setup Script

You can run the following DDL script in your Supabase SQL Editor to initialize the database:

```sql
CREATE TABLE IF NOT EXISTS public.user_library (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    imdb_id TEXT NOT NULL,
    title TEXT NOT NULL,
    poster TEXT,
    rating TEXT,
    genre TEXT,
    year TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT user_library_user_id_imdb_id_key UNIQUE (user_id, imdb_id)
);

ALTER TABLE public.user_library ENABLE ROW LEVEL SECURITY;
```
