import os
import psycopg2

def init_db():
    conn_str = os.environ.get("SUPABASE_CONNECTION_STRING")
    try:
        with psycopg2.connect(conn_str) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        nom VARCHAR(255) NOT NULL,
                        prenom VARCHAR(255) NOT NULL,
                        mail VARCHAR(255) UNIQUE NOT NULL,
                        mdp TEXT NOT NULL,
                        role VARCHAR(50) DEFAULT 'USER',
                        mfa_secret TEXT,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        last_login_at TIMESTAMP WITH TIME ZONE
                    );
                """)
                
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS conversations (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                        title TEXT,
                        is_active BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS messages (
                        id SERIAL PRIMARY KEY,
                        conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
                        question TEXT NOT NULL,
                        label VARCHAR(100),
                        sub_label VARCHAR(100),
                        tags JSONB,
                        contexts JSONB,
                        response TEXT NOT NULL,
                        file JSONB,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );
                """)

                cur.execute("""
                    CREATE TABLE IF NOT EXISTS sessions (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                        device_info TEXT,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        expires_at TIMESTAMP WITH TIME ZONE NOT NULL
                    );
                """)
            conn.commit()
    except Exception as e:
        return