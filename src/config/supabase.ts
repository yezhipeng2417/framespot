import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

// 确保这两个值从环境变量中获取或从Constants中获取
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || "";
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || "";

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
