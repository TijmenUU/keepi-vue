using FastEndpoints;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddFastEndpoints(options =>
{
  options.Assemblies = [
    typeof(Keepi.Api.GetTest.GetTestEndpoint).Assembly
  ];
});
builder.Services.AddSpaYarp();

var app = builder.Build();

app.UseHttpsRedirection();

app.UseFastEndpoints(config =>
{
  config.Endpoints.RoutePrefix = "api";
});

// app.MapGet("/", () => "Hello World!");

// TODO if development use YARP, otherwise serve the Vue app through the fallback handler
app.UseSpaYarp();
// app.MapFallbackToFile("index.html"); // PROD ONLY

app.Run();
