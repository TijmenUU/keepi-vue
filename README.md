# Keepi ASP.Net

## Repository structure

This repository roughly follows the [.NET example](https://devblogs.microsoft.com/ise/next-level-clean-architecture-boilerplate/) of [clean architecture](<https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)>). Key to the concept of clean architecture is that dependencies flow inward and any implementation details are provided through so called plug-ins. In practice this means that the `src/Keepi.Core` project represents the center towards which all projects "point" in terms of dependency. A project such as the `src/Keepi.Infrastructure.Data` provides a persistence plug-in to the core by implementing the persistence related interfaces declared by the core.

The following (non testing) projects are part of this repository, followed by a short description:

| Name                      | Description                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keepi.Core                | The project containing all business logic without concerning itself with the exact implementation of input and output.                              |
| Keepi.Infrastructure.Data | A persistence layer implemented through EF Core and Sqlite3.                                                                                        |
| Keepi.Api                 | A JSON API serving as an input output wrapper around Keepi.Core                                                                                     |
| Keepi.Vue                 | A Vue 3 web client application which uses the Keepi.Api provided HTTP endpoints to allow the user to interact with the business logic of Keepi.Core |
| Keepi.Web                 | An ASP.Net Core project that combines the JSON API of Keepi.Api and the web client of Keepi.Vue to create a so called backend before frontend setup |

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
