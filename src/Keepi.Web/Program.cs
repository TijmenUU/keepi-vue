using FastEndpoints;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddFastEndpoints(options =>
{
  options.Assemblies = [
    typeof(Keepi.Api.GetTest.GetTestEndpoint).Assembly
  ];
});

if (builder.Environment.IsDevelopment())
{
  builder.Services.AddSpaYarp();
}

var app = builder.Build();

app.UseHttpsRedirection();

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
