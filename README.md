# Keepi ASP.Net

## Required software

- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0) including the ASP.Net runtime
- [bun](https://bun.sh/)

## Secrets

This project uses some secrets, which are required to be setup:

```bash
dotnet user-secrets set 'Authentication:GitHub:ClientId' 'YOUR_CLIENT_ID' --project 'src/Keepi.Web/'
dotnet user-secrets set 'Authentication:GitHub:ClientSecret' 'YOUR_CLIENT_SECRET' --project 'src/Keepi.Web/'
```

## HTTPS certificate not trusted on Linux

The combination of Linux and Firefox seems to work after using this third party tool:

```bash
dotnet tool update -g linux-dev-certs
dotnet linux-dev-certs install
```