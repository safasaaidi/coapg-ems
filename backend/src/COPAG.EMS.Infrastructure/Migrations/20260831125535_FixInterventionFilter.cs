using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace COPAG.EMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixInterventionFilter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DueDate",
                table: "WorkOrders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Instructions",
                table: "WorkOrders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaintenanceType",
                table: "WorkOrders",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "InterventionPart",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InterventionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterventionPart", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterventionPart_Interventions_InterventionId",
                        column: x => x.InterventionId,
                        principalTable: "Interventions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InterventionPart_InterventionId",
                table: "InterventionPart",
                column: "InterventionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InterventionPart");

            migrationBuilder.DropColumn(
                name: "DueDate",
                table: "WorkOrders");

            migrationBuilder.DropColumn(
                name: "Instructions",
                table: "WorkOrders");

            migrationBuilder.DropColumn(
                name: "MaintenanceType",
                table: "WorkOrders");
        }
    }
}
