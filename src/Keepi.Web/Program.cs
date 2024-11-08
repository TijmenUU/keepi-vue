using AspNet.Security.OAuth.GitHub;
using FastEndpoints;
using Keepi.Api.Endpoints.GetTest;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;

internal class Program
{
  private static void Main(string[] args)
  {
    var builder = WebApplication.CreateBuilder(args);

    // https://fast-endpoints.com/docs/get-started#create-project-install-package
    builder.Services.AddFastEndpoints(options =>
    {
      options.Assemblies = [
        typeof(GetTestEndpoint).Assembly
      ];
    });

    if (builder.Environment.IsDevelopment())
    {
      // https://github.com/berhir/AspNetCore.SpaYarp
      builder.Services.AddSpaYarp();
    }

    builder.Services.AddAuthorization(configure =>
    {
      configure.DefaultPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
    });
    builder.Services
      .AddAuthentication(options =>
      {
        options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
      })
      .AddCookie(options =>
      {
        options.LoginPath = "/signin";
        options.LogoutPath = "/signout";
      })
      // https://github.com/aspnet-contrib/AspNet.Security.OAuth.Providers
      .AddGitHub(options =>
      {
        options.ClientId = builder.Configuration["Authentication:GitHub:ClientId"] ?? throw new InvalidOperationException("The GitHub client ID is not configured");
        options.ClientSecret = builder.Configuration["Authentication:GitHub:ClientSecret"] ?? throw new InvalidOperationException("The GitHub client secret is not configured");
        options.CallbackPath = "/signin-oidc-github";
        options.Scope.Add("user:email");
      });

    var app = builder.Build();

    app.UseHttpsRedirection();

    app.MapGet("/signin", () => Results.Challenge(
      properties: new Microsoft.AspNetCore.Authentication.AuthenticationProperties
      {
        RedirectUri = "/"
      },
      authenticationSchemes: [GitHubAuthenticationDefaults.AuthenticationScheme]));
    app.MapGet("/signout", () => Results.SignOut(
      properties: new Microsoft.AspNetCore.Authentication.AuthenticationProperties
      {
        RedirectUri = "https://www.google.nl" // TODO Use an actual sign out page?
      },
      authenticationSchemes: [CookieAuthenticationDefaults.AuthenticationScheme]));

    app.UseAuthentication();
    app.UseAuthorization();

    app.UseFastEndpoints(config =>
    {
      config.Endpoints.RoutePrefix = "api";
    });

    if (builder.Environment.IsDevelopment())
    {
      app.UseSpaYarp();
    }
    else
    {
      app.UseStaticFiles();
      app.MapFallbackToFile("index.html");
    }

    app.Run();
  }
}