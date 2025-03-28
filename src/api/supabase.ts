import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

// 在实际开发中，这些值应该从环境变量或 Constants.manifest.extra 获取
const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
