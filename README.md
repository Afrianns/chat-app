# DOKUMENTASI PENJELASAN

Link Website: ![Link Chat Aplikasi](https://chat-app-psi-nine-79.vercel.app)

## Dummy User List

### Dummy User Pertama
**EMAIL:** jackson@gmail.com
**PASSWORD:** alskdj23jiajnlknKJKLSFJ

### Dummy User Kedua
**EMAIL:** alexander@gmail.com
**PASSWORD:** asdjKASDj358kJKOHD

## Pemilihan Tech stack & Infrastruktur

**NextJS dangan TypeScript**, Memudahkan kobinasi dengan server side serta penggunaan typescript agar tipe data mudah diprediksi dan mudah untuk mengetahui _error_ -nya.

**TailwindCSS**, _utility-class_ pada tailwind memudahkan dalam kostumisasi tampilan tanpa membuat style terlihat mirip satu sama lain serta memudahkan pengerjaan css yang bisa memakan waktu lebih lama

**Supabase**, BaaS dengan kemudahan konfigurasi serta keamanan dengan NextJS lebih mempercepat pengembangan tanpa harus install manual database atau memakai docker,

**Prisma**, ORM dengan Supabase untuk kemudahan dan flexsibilitas dalam _query_ data serta migrasi yang lebih _natural_.

**Clerk**, Authentikasi dan manajemen _user_ yang memudahkan tanpa mengurusi integrasi Oauth dengan google ataupun masalah keamanan.

**Pusher**, Informasi obrolan secara _realtime_, konfigurasi yang mudah serta free tier dengan _resources_ yang lebih besar.

**Vercel**, Kemudahan dalam integrasi langsung dengan next secara serverless serta support optimisasi nextjs di vercel mengingat vercel sebagai maintainer dari NextJS itu sendiri. 

## Struktur Tabel

<img width="2157" height="1385" alt="schema" src="https://github.com/user-attachments/assets/32120a1f-68db-4726-8fb4-34dd37f84158" />

### SQL query
```
CREATE TABLE public.User (
  id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  username text NOT NULL,
  email text NOT NULL,
  clerk_user_id text NOT NULL,
  avatar text,
  CONSTRAINT User_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Conversation (
  id text NOT NULL,
  first_user_id text NOT NULL,
  second_user_id text NOT NULL,
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL,
  CONSTRAINT Conversation_pkey PRIMARY KEY (id),
  CONSTRAINT Conversation_first_user_id_fkey FOREIGN KEY (first_user_id) REFERENCES public.User(id),
  CONSTRAINT Conversation_second_user_id_fkey FOREIGN KEY (second_user_id) REFERENCES public.User(id)
);
CREATE TABLE public.Message (
  id text NOT NULL,
  conversation_id text NOT NULL,
  sender_id text NOT NULL,
  content text NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL,
  is_readed boolean NOT NULL DEFAULT false,
  CONSTRAINT Message_pkey PRIMARY KEY (id),
  CONSTRAINT Message_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.Conversation(id),
  CONSTRAINT Message_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.User(id)
);
```
## Cara menjalankan secara lokal

- Clone repo
- buat `env` lokal dengan format seperti ini:

```
# Clerk routing
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Supabase database URL
DATABASE_URL=""

# Pusher credential
PUSHER_APP_ID = ""
PUSHER_KEY = ""
PUSHER_SECRET = ""
PUSHER_CLUSTER = ""
NEXT_PUBLIC_PUSHER_KEY = ""
NEXT_PUBLIC_PUSHER_CLUSTER = ""

```
- lakukan "npm install" atau "npm i"
- jalankan "npm run dev" atau "npm run build"


## AI Tool yang digunakan

- Gemini _Google Search_
- ChatGPT
- Antigravity (Model: Gemini flash, Claude Opus [free version] )

## Hal yang belum selesai

- Responsifitas di mobile (untuk sekarang hanya _desktop_)
- Kecepatan dalam mengirim pesan atau pengiriman instan
- belum terdapat sistem pencarian di ``sidebar preview chat``. 
