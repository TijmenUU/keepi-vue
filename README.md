# Keepi ASP.Net

## Required software

- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0) including the ASP.Net runtime
- [bun](https://bun.sh/)
- [SQLite3](https://sqlite.org/)

## Secrets

This project uses some secrets, which are required to be setup:

```bash
dotnet user-secrets set 'Authentication:GitHub:ClientId' 'YOUR_CLIENT_ID' --project 'src/Keepi.Web/'
dotnet user-secrets set 'Authentication:GitHub:ClientSecret' 'YOUR_CLIENT_SECRET' --project 'src/Keepi.Web/'
```

## Creating database migrations

```bash
dotnet ef migrations add InitialCreate -p src/Keepi.Infrastructure.Data -s src/Keepi.Web
```

## Creating the database

```bash
dotnet ef database update -p src/Keepi.Infrastructure.Data -s src/Keepi.Web
```

## HTTPS certificate not trusted on Linux

The combination of Linux and Firefox seems to work after using this third party tool:

```bash
dotnet tool update -g linux-dev-certs
dotnet linux-dev-certs install
```
