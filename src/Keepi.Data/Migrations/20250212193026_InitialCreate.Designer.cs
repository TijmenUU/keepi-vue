﻿// <auto-generated />
using System;
using Keepi.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace Keepi.Data.Migrations
{
    [DbContext(typeof(DatabaseContext))]
    [Migration("20250212193026_InitialCreate")]
    partial class InitialCreate
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "9.0.1");

            modelBuilder.Entity("Keepi.Data.Entities.EntryCategoryEntity", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<DateOnly?>("ActiveFrom")
                        .HasColumnType("TEXT");

                    b.Property<DateOnly?>("ActiveTo")
                        .HasColumnType("TEXT");

                    b.Property<bool>("Enabled")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<int>("UserId")
                        .HasColumnType("INTEGER");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.HasIndex("ActiveFrom", "ActiveTo");

                    b.HasIndex("Name", "UserId")
                        .IsUnique();

                    b.ToTable("EntryCategories");
                });

            modelBuilder.Entity("Keepi.Data.Entities.UserEntity", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("EmailAddress")
                        .IsRequired()
                        .HasMaxLength(128)
                        .HasColumnType("TEXT");

                    b.Property<string>("ExternalId")
                        .IsRequired()
                        .HasMaxLength(64)
                        .HasColumnType("TEXT");

                    b.Property<int>("IdentityOrigin")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(128)
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("EmailAddress")
                        .IsUnique();

                    b.HasIndex("ExternalId")
                        .IsUnique();

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Keepi.Data.Entities.UserEntryEntity", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<DateOnly>("Date")
                        .HasColumnType("TEXT");

                    b.Property<int>("EntryCategoryId")
                        .HasColumnType("INTEGER");

                    b.Property<int>("Minutes")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Remark")
                        .HasColumnType("TEXT");

                    b.Property<int>("UserId")
                        .HasColumnType("INTEGER");

                    b.HasKey("Id");

                    b.HasIndex("Date");

                    b.HasIndex("EntryCategoryId");

                    b.HasIndex("UserId");

                    b.ToTable("UserEntries");
                });

            modelBuilder.Entity("Keepi.Data.Entities.EntryCategoryEntity", b =>
                {
                    b.HasOne("Keepi.Data.Entities.UserEntity", "User")
                        .WithMany("EntryCategories")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("Keepi.Data.Entities.UserEntryEntity", b =>
                {
                    b.HasOne("Keepi.Data.Entities.EntryCategoryEntity", "EntryCategory")
                        .WithMany("UserEntries")
                        .HasForeignKey("EntryCategoryId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Keepi.Data.Entities.UserEntity", "User")
                        .WithMany("Entries")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("EntryCategory");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Keepi.Data.Entities.EntryCategoryEntity", b =>
                {
                    b.Navigation("UserEntries");
                });

            modelBuilder.Entity("Keepi.Data.Entities.UserEntity", b =>
                {
                    b.Navigation("Entries");

                    b.Navigation("EntryCategories");
                });
#pragma warning restore 612, 618
        }
    }
}
