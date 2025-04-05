<!--
 * @Description: 
 * @Date: 2025-04-01 12:19:20
 * @LastEditTime: 2025-04-05 17:27:51
 * @FilePath: /framespot/README.md
 * @LastEditors: Xinyi Yan
-->
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.




错误信息和搜索结果来看，这确实是一个已知问题。让我分析一下具体情况：
系统试图全局安装 @expo/ngrok，但似乎安装后仍然无法识别。这个问题在 macOS 上比较常见，可能与权限或路径有关。
根据搜索结果，有几种解决方案：
a. 直接在项目中安装 ngrok（而不是全局安装）：✅
   npm install @expo/ngrok --save-dev
b. 或者尝试使用 sudo 进行全局安装：
   sudo npm install --global @expo/ngrok@^4.1.0






sudo npm install --global '@expo/ngrok@^4.1.0' && npx expo start --tunnel

npx expo start --tunnel


