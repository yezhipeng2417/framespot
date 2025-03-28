import { supabase } from "../config/supabase";
import { PostgrestError } from "@supabase/supabase-js";

// 基础错误处理
export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }

  static fromPostgrestError(error: PostgrestError): ApiError {
    return new ApiError(error.message, error.code === "23505" ? 409 : 500);
  }
}

// 用户相关API
export const userApi = {
  // 获取用户资料
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw ApiError.fromPostgrestError(error);
    return data;
  },

  // 更新用户资料
  updateProfile: async (userId: string, updates: any) => {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);

    if (error) throw ApiError.fromPostgrestError(error);
    return data;
  },
};

// 照片相关API
export const photoApi = {
  // 获取公开照片列表
  getPublicPhotos: async (page: number = 1, limit: number = 20) => {
    const { data, error } = await supabase
      .from("photos")
      .select("*, profiles:user_id(username, avatar_url)")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw ApiError.fromPostgrestError(error);
    return data;
  },

  // 获取附近的照片
  getNearbyPhotos: async (
    lat: number,
    lng: number,
    radiusInMeters: number = 5000,
  ) => {
    // 使用PostGIS查询附近照片
    const { data, error } = await supabase.rpc("get_photos_within_radius", {
      lat,
      lng,
      radius_meters: radiusInMeters,
    });

    if (error) throw ApiError.fromPostgrestError(error);
    return data;
  },

  // 创建新照片
  createPhoto: async (photoData: any) => {
    const { data, error } = await supabase
      .from("photos")
      .insert(photoData)
      .select()
      .single();

    if (error) throw ApiError.fromPostgrestError(error);
    return data;
  },
};

// 互动相关API
export const interactionApi = {
  // 点赞照片
  likePhoto: async (photoId: string, userId: string) => {
    const { data, error } = await supabase
      .from("likes")
      .insert({ photo_id: photoId, user_id: userId })
      .select()
      .single();

    if (error) throw ApiError.fromPostgrestError(error);
    return data;
  },

  // 取消点赞
  unlikePhoto: async (photoId: string, userId: string) => {
    const { error } = await supabase
      .from("likes")
      .delete()
      .match({ photo_id: photoId, user_id: userId });

    if (error) throw ApiError.fromPostgrestError(error);
    return true;
  },

  // 添加评论
  addComment: async (photoId: string, userId: string, content: string) => {
    const { data, error } = await supabase
      .from("comments")
      .insert({ photo_id: photoId, user_id: userId, content })
      .select()
      .single();

    if (error) throw ApiError.fromPostgrestError(error);
    return data;
  },
};
