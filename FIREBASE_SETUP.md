# Firebase設定手順（端末間同期・複数グループ）

このアプリは、GitHub Pagesでの公開方法を変えずにFirebaseへ学習記録を保存できます。

- 従来URL：今まで通り`names.txt`を使い、既存データを表示
- `?group=グループID`付きURL：パスワードで保護された別グループを表示し、名前は画面から登録

新しいグループでは、名前・6分野のレベル・XP・連続日数・最終学習日時が他の新グループから見えないように分離されます。

## 1. 既存ユーザーへの影響

次の従来URLは変更しません。

```text
https://ユーザー名.github.io/リポジトリ名/
```

`firebase-config.js`の既定グループ`nobiru-family-01`と、従来のブラウザ保存キー`nobiru-progress`をそのまま使います。名前もこれまで通り`names.txt`から読み込みます。

新グループだけ、次のような引数付きURLを使います。

```text
https://ユーザー名.github.io/リポジトリ名/?group=team-02
```

最新版を指定する場合は、引数を`&`でつなぎます。

```text
https://ユーザー名.github.io/リポジトリ名/?group=team-02&update=47
```

## 2. Firebase Authenticationを有効にする

1. [Firebaseコンソール](https://console.firebase.google.com/)で、現在このアプリに使っているプロジェクトを開きます。
2. 左側の「構築」または「プロダクトのカテゴリ」から「Authentication」を開きます。
3. 初回だけ「始める」を押します。
4. 「Sign-in method」または「ログイン方法」タブを開きます。
5. 「メール／パスワード」を選びます。
6. 上側の「メール／パスワード」を有効にして保存します。「メールリンク」は無効のままで構いません。

### GitHub Pagesのドメインを許可する

1. Authenticationの「設定」を開きます。
2. 「承認済みドメイン」を開きます。
3. GitHub Pagesのドメインを追加します。

例：URLが`https://sample.github.io/nobiru/`なら、追加する値は次の通りです。

```text
sample.github.io
```

`https://`や、後ろのリポジトリ名は入力しません。

## 3. 新しいグループ用ユーザーを作る

ここではグループIDを`team-02`とします。グループIDは、40文字以内の半角英数字・ハイフン・アンダーバーで決めてください。

1. Authenticationの「Users」または「ユーザー」タブを開きます。
2. 「ユーザーを追加」を押します。
3. メールアドレス欄へ`team-02@nobiru.example`と入力します。
4. グループの利用者へ知らせるパスワードを決めて入力します。
5. 「ユーザーを追加」を押します。
6. 作成されたユーザーの「ユーザーUID」をコピーして控えます。

`@nobiru.example`はアプリ内のグループ認証にだけ使う識別子です。実際のメール受信には使いません。パスワードを忘れた場合は、Firebaseコンソールから再設定します。

重要：パスワードは`firebase-config.js`、GitHubのファイル、URLのどこにも書かないでください。

## 4. Firestoreへグループのメンバーを登録する

1. Firebase左側の「Firestore」または「Database と Storage」→「Firestore」を開きます。
2. 上部の「データ」タブを開きます。
3. `nobiru_groups`コレクションを開きます。ない場合は「コレクションを開始」で作ります。
4. ドキュメントIDを`team-02`にします。
5. 親ドキュメントを初めて作る場合は、フィールド`displayName`、種類`string`、値`team-02`を追加して保存します。
6. `team-02`ドキュメントを開き、「コレクションを開始」を押します。
7. サブコレクションIDを`members`にします。
8. ドキュメントIDへ、手順3でコピーしたFirebase Authenticationの「ユーザーUID」を貼り付けます。
9. フィールド`role`、種類`string`、値`member`を追加して保存します。

完成時の形は次の通りです。

```text
nobiru_groups
└─ team-02
   └─ members
      └─ Firebase AuthenticationのUID
         └─ role: "member"
```

アプリで最初の名前を登録すると、同じ`team-02`の下へ`learners`が自動作成されます。

## 5. Firestoreルールを更新する

1. Firestore上部の「ルール」タブを開きます。
2. 現在表示されているルールをすべて選択して削除します。
3. このフォルダの`firestore.rules`をメモ帳で開き、全文をコピーして貼り付けます。
4. 「公開」を押します。

新しいルールでは次のように動作します。

- `nobiru-family-01`：既存ユーザーを今まで通り利用可能
- それ以外：ログイン中のUIDが、そのグループの`members`にある場合だけ読み書き可能
- 名前やレベルを保存できる項目と数値範囲は従来通り制限

`firebase-config.js`の既定`groupId`を変更する場合は、`firestore.rules`内の`nobiru-family-01`も同じ値へ変更してください。通常は変更しません。

## 6. アプリのFirebase設定を確認する

`firebase-config.js`は次の形です。すでに端末間同期が動いている場合、`firebaseConfig`の値は変更しません。

```js
window.NOBIRU_FIREBASE = {
  enabled: true,
  groupId: "nobiru-family-01",
  groupEmailDomain: "nobiru.example",
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

新しいグループを増やすたびに`firebase-config.js`を書き換える必要はありません。Authenticationのユーザー、Firestoreの`members`、グループURLを追加するだけです。

## 7. GitHubへ更新ファイルをアップロードする

今回、GitHubの同じ場所へ上書きするファイルは次の10個です。

1. `app.js`
2. `styles.css`
3. `firebase-sync.js`
4. `firebase-config.js`
5. `index.html`
6. `version.json`
7. `README.md`
8. `UPDATE_GUIDE.md`
9. `FIREBASE_SETUP.md`
10. `firestore.rules`

`firestore.rules`はGitHubへアップロードするだけではFirebaseのルールは変わりません。必ずFirebaseコンソールの「ルール」タブでも貼り付けて公開してください。

## 8. 動作確認

1. 従来URLを開き、今までの名前一覧とレベルが表示されることを確認します。
2. 新グループURL`?group=team-02&update=47`を開きます。
3. グループ用パスワードを入力します。
4. 「新しく登録する名前」へ名前を入力し、「この名前を登録して始める」を押します。
5. 1問学習してレベルを保存します。
6. 別端末で同じ新グループURLとパスワードを使い、登録名とレベルが表示されることを確認します。
7. 別のグループURLを開き、`team-02`の名前が表示されないことを確認します。

一度ログインした端末ではFirebaseが認証状態を保持するため、通常は次回からグループ用パスワードの入力を省略できます。

## 9. 別のグループを追加する例

2つ目の新グループを`team-03`にする場合は、次の3点を追加します。

1. Authenticationユーザー：`team-03@nobiru.example`
2. Firestoreメンバー：`nobiru_groups / team-03 / members / そのユーザーのUID`
3. 利用URL：`https://ユーザー名.github.io/リポジトリ名/?group=team-03`

各グループで異なるパスワードを設定してください。

## セキュリティ上の注意

URLの`group`は保存先を選ぶための識別子で、秘密情報ではありません。新グループの保護はFirebase AuthenticationのパスワードとFirestoreルールで行います。

既存グループは「今まで通り」を優先して認証なしの動作を残しています。そのため、従来URLを知っている人への既存グループの非公開化までは行いません。既存グループも完全に保護する場合は、全利用者を新グループ方式へ移行する追加作業が必要です。
