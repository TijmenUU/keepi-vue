var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSpaYarp();

var app = builder.Build();

app.UseHttpsRedirection();

// app.MapGet("/", () => "Hello World!");

app.UseSpaYarp();

app.Run();
