# Firebase設定手順（index.html・index2.htmlの2グループ）

グループを簡単に分ける方式です。Firebase Authentication、パスワード、メンバーUIDの登録は使いません。

## 使い分け

### 今までのユーザー

```text
https://ユーザー名.github.io/リポジトリ名/
```

または、明示的に`index.html`を付けます。

```text
https://ユーザー名.github.io/リポジトリ名/index.html
```

- 今まで通り`names.txt`から名前を読み込みます。
- 今までのFirebase保存先`nobiru-family-01`を使います。
- 今までの名前とレベルは変更されません。

### 新しいユーザー

```text
https://ユーザー名.github.io/リポジトリ名/index2.html
```

- `names.txt`は使いません。
- 最初の画面で名前と現在の学年を選んで登録します。
- 学年は名前の初回登録時だけ選び、選んだ学年の開始レベルが6分野へ設定されます。
- Firebase保存先は`nobiru-group-02`です。
- `index.html`側の名前は表示されません。
- 新しいグループの名前とレベルは、同じ`index2.html`を開いた端末間で共有されます。

## Firebaseで行うこと

新しいグループ用のAuthenticationユーザーやパスワードは不要です。行うことはFirestoreルールの貼り直しだけです。

1. [Firebaseコンソール](https://console.firebase.google.com/)で現在のプロジェクトを開きます。
2. 左側の「Firestore」を開きます。
3. 上部の「ルール」タブを開きます。
4. 現在の内容をすべて選択して削除します。
5. このフォルダの`firestore.rules`をメモ帳で開き、全文をコピーして貼り付けます。
6. 「公開」を押します。

Firestoreの「データ」タブで`nobiru-group-02`を先に作る必要はありません。`index2.html`で最初の名前を登録すると、自動的に保存先が作成されます。

## GitHubへアップロードするファイル

次の12ファイルを、GitHubの現在のファイルと同じ場所へ上書き・追加してください。

1. `app.js`
2. `styles.css`
3. `firebase-sync.js`
4. `firebase-config.js`
5. `firestore.rules`
6. `index.html`
7. `index2.html`（新規追加）
8. `version.json`
9. `manifest2.webmanifest`（新規追加）
10. `README.md`
11. `UPDATE_GUIDE.md`
12. `FIREBASE_SETUP.md`

重要：`firestore.rules`はGitHubへアップロードするだけではFirebaseへ反映されません。Firebaseコンソールの「ルール」タブでも貼り付けて公開してください。

## 更新後の確認

1. 従来URLを開き、今までの名前とレベルが表示されることを確認します。
2. 次の新グループURLを開きます。

```text
https://ユーザー名.github.io/リポジトリ名/index2.html?update=49
```

3. 「新しく登録する名前」へ名前を入力します。
4. 現在の学年を選びます。学年選択は、この名前の初回登録時だけ表示されます。
5. 「この名前を登録して始める」を押します。
6. 選んだ学年の開始レベルになっていることを確認し、一度学習します。
7. 別端末で`index2.html`を開き、登録した名前とレベルが表示されることを確認します。
8. 従来の`index.html`を開き、新グループの名前が表示されないことを確認します。

## 3つ目のグループを作る場合

将来3つ目が必要になった場合は、`index2.html`を`index3.html`として複製し、先頭付近の次の部分だけ変更します。

```js
window.NOBIRU_PAGE_GROUP = {
  groupId: "nobiru-group-03",
  label: "3つ目のグループ",
  nameMode: "registration",
};
```

`groupId`が違えば、名前とレベルの保存先も別になります。

## セキュリティについて

この方式は「画面上で2グループの名前を混ぜない」ための簡易分離です。ログイン認証はありません。

そのため、`index.html`または`index2.html`のURLを知っている人は、それぞれのグループを開けます。高い秘匿性はありませんが、今回の「通常利用時に2グループ間でメンバーを表示しない」という目的には適した簡単な方法です。
