export default ({ config }) => {
  return {
    ...config,
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      eas: {
        projectId: process.env.EAS_PROJECT_ID,
      },
    },
  };
}; 