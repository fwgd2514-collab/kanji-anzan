# Firebaseでレベルを端末間共有する

この設定を行うと、GitHub Pagesの公開方法はそのままで、名前ごとの6分野のレベル・XP・連続日数をFirestoreへ保存できます。
Firebaseが未設定、オフライン、または接続エラーの場合も、端末内保存で学習を続けられます。

## 1. Firebaseプロジェクトを作る

1. [Firebaseコンソール](https://console.firebase.google.com/)を開きます。
2. 「プロジェクトを追加」を選びます。
3. 分かりやすいプロジェクト名を入力します。
4. Google Analyticsは、この学習アプリの同期だけなら無効でも構いません。

## 2. Webアプリを登録する

1. Firebaseの「プロジェクトの概要」を開きます。
2. Webアプリのアイコン `</>` を選びます。
3. アプリ名を入力して登録します。
4. 表示された `firebaseConfig` の内容を控えます。

## 3. Firestoreを作る

1. Firebase左側の「Database と Storage」から「Firestore」を開きます。
2. 「データベースの作成」を選びます。作成済みの場合はこの操作は不要です。
3. ロケーションを選べる場合、日本で使うなら東京 `asia-northeast1` を選びます。既に `nam5` などが自動設定されている場合は、そのまま利用できます。
4. 作成後、「ルール」タブを開きます。
5. このフォルダの `firestore.rules` の内容をすべて貼り付けて「公開」を押します。

## 4. アプリへ設定を入れる

`firebase-config.js` をメモ帳で開きます。

1. `firebaseConfig` 内の値を、Firebaseコンソールに表示された値へ置き換えます。
2. `enabled: false` を `enabled: true` へ変更します。
3. `groupId` は英数字で分かりやすい文字列に変更できます。

設定例：

```js
window.NOBIRU_FIREBASE = {
  enabled: true,
  groupId: "nobiru-family-01",
  firebaseConfig: {
    apiKey: "Firebaseに表示された値",
    authDomain: "Firebaseに表示された値",
    projectId: "Firebaseに表示された値",
    storageBucket: "Firebaseに表示された値",
    messagingSenderId: "Firebaseに表示された値",
    appId: "Firebaseに表示された値",
  },
};
```

## 5. GitHubへアップロードする

このフォルダ内のファイルをすべてGitHubへ再アップロードします。
公開ページの「設定」画面で「Firebaseと同期済み」または「同期ON」と表示されれば完了です。

別の端末でも同じGitHub PagesのURLを開くと、同じ `groupId` の6分野レベル一覧を取得します。

旧版から更新する場合は、GitHubへファイルをアップロードする前に、更新後の `firestore.rules` をFirebaseで再公開してください。詳しくは `UPDATE_GUIDE.md` を参照してください。

## 試用版のセキュリティについて

同梱のルールは、保存できる項目と数値の範囲を制限していますが、ログイン認証は行いません。
名前・レベルの秘匿性が低い小規模な試用を想定しています。
第三者による書き換えも防ぎたい場合は、次の段階でFirebase Authenticationを追加してください。
