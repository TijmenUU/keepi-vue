using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Keepi.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ExternalId = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    EmailAddress = table.Column<string>(type: "TEXT", maxLength: 128, nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 128, nullable: false),
                    IdentityOrigin = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EntryCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Enabled = table.Column<bool>(type: "INTEGER", nullable: false),
                    ActiveFrom = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    ActiveTo = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EntryCategories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EntryCategories_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserEntries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    EntryCategoryId = table.Column<int>(type: "INTEGER", nullable: false),
                    Date = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    Minutes = table.Column<int>(type: "INTEGER", nullable: false),
                    Remark = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserEntries_EntryCategories_EntryCategoryId",
                        column: x => x.EntryCategoryId,
                        principalTable: "EntryCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserEntries_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EntryCategories_ActiveFrom_ActiveTo",
                table: "EntryCategories",
                columns: new[] { "ActiveFrom", "ActiveTo" });

            migrationBuilder.CreateIndex(
                name: "IX_EntryCategories_Name_UserId",
                table: "EntryCategories",
                columns: new[] { "Name", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EntryCategories_UserId",
                table: "EntryCategories",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserEntries_Date",
                table: "UserEntries",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_UserEntries_EntryCategoryId",
                table: "UserEntries",
                column: "EntryCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_UserEntries_UserId",
                table: "UserEntries",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_EmailAddress",
                table: "Users",
                column: "EmailAddress",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_ExternalId",
                table: "Users",
                column: "ExternalId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserEntries");

            migrationBuilder.DropTable(
                name: "EntryCategories");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
