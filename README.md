# WordPress Headless

WordPress（Bedrock）でコンテンツを管理し、Astro でフロントエンドを開発するプロジェクトです。

## 起動手順

### 1. WordPress と MySQL を起動

`apps/.env` がなければ、[環境変数のひな形](apps/wordpress/.env.example) を `apps/.env` にコピーします。ポートや DB の設定を変更する場合は、この `.env` を編集します。

Docker Desktop を起動し、リポジトリのルートから次のコマンドを実行すると、`apps/.env` が自動で読み込まれます。

```bash
cd apps
docker compose up -d
```

初回は [WordPress 管理画面](http://localhost:8080/wp/wp-admin/) を開いてセットアップします。`WORDPRESS_PORT` を変更した場合は、設定したポートを使います。

### 2. Astro を起動

別のターミナルで Node.js `22.23.4` 以上と pnpm `12.18.0` を用意し、リポジトリのルートから実行します。

```bash
cd apps/astro
pnpm install --frozen-lockfile
pnpm dev
```

[Astro の開発ページ](http://localhost:4321/) を開きます。

