import React, { useState } from 'react';
import { Code2, Copy, Check, FileCode, Folder, Database, Terminal, Layers } from 'lucide-react';

interface CodeFile {
  name: string;
  path: string;
  language: string;
  category: 'Context' | 'Config' | 'Models' | 'Controllers' | 'Migrations' | 'Commands';
  content: string;
}

export const CodeExplorerView: React.FC = () => {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const codeFiles: CodeFile[] = [
    {
      name: 'DSACDbContext.cs',
      path: 'DSAC.Data/DSACDbContext.cs',
      category: 'Context',
      language: 'csharp',
      content: `using System;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;
using DSAC.Domain.Entities;

namespace DSAC.Data
{
    /// <summary>
    /// Department of Sport, Arts and Culture (DSAC) - Entity Framework 6 Code First Database Context
    /// Public Entities Reporting System (PERS)
    /// Target Framework: .NET Framework 4.7.2 / EF 6.4.4 / SQL Server
    /// </summary>
    public class DSACDbContext : DbContext
    {
        public DSACDbContext() : base("name=DSACConnection")
        {
            // Disable lazy loading and proxy creation for high-performance Web API 2 serialization
            this.Configuration.LazyLoadingEnabled = false;
            this.Configuration.ProxyCreationEnabled = false;
            
            Database.SetInitializer(new MigrateDatabaseToLatestVersion<DSACDbContext, Migrations.Configuration>());
        }

        public static DSACDbContext Create()
        {
            return new DSACDbContext();
        }

        // Entity Framework 6 DbSets
        public virtual DbSet<PublicEntity> PublicEntities { get; set; }
        public virtual DbSet<NonProfitOrganisation> NonProfitOrganisations { get; set; }
        public virtual DbSet<KPI> KPIs { get; set; }
        public virtual DbSet<StatutoryReport> StatutoryReports { get; set; }
        public virtual DbSet<DocumentRecord> DocumentRecords { get; set; }
        public virtual DbSet<DocumentVersion> DocumentVersions { get; set; }
        public virtual DbSet<DocumentComment> DocumentComments { get; set; }
        public virtual DbSet<FinancialRecord> FinancialRecords { get; set; }
        public virtual DbSet<AuditFinding> AuditFindings { get; set; }
        public virtual DbSet<JobCreationStat> JobCreationStats { get; set; }
        public virtual DbSet<SystemAuditLog> SystemAuditLogs { get; set; }
        public virtual DbSet<NotificationAlert> NotificationAlerts { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Remove pluralizing table name convention for clean government DB schemas
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();
            modelBuilder.Conventions.Remove<OneToManyCascadeDeleteConvention>();

            // PublicEntity Configuration
            modelBuilder.Entity<PublicEntity>()
                .ToTable("DSAC_PublicEntities", "dbo")
                .HasKey(e => e.Id);

            modelBuilder.Entity<PublicEntity>()
                .Property(e => e.Acronym)
                .IsRequired()
                .HasMaxLength(20);

            modelBuilder.Entity<PublicEntity>()
                .Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(250);

            modelBuilder.Entity<PublicEntity>()
                .Property(e => e.BudgetAllocated)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PublicEntity>()
                .Property(e => e.BudgetSpent)
                .HasPrecision(18, 2);

            // Document Versioning Relationship (Preserves complete immutable history)
            modelBuilder.Entity<DocumentVersion>()
                .ToTable("DSAC_DocumentVersions", "dbo")
                .HasRequired(v => v.DocumentRecord)
                .WithMany(d => d.Versions)
                .HasForeignKey(v => v.DocumentRecordId)
                .WillCascadeOnDelete(false);

            // Financial Decimal Precisions
            modelBuilder.Entity<FinancialRecord>()
                .Property(f => f.AllocatedAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<FinancialRecord>()
                .Property(f => f.SpentAmount)
                .HasPrecision(18, 2);

            // Immutable Audit Log
            modelBuilder.Entity<SystemAuditLog>()
                .ToTable("DSAC_SystemAuditLogs", "dbo")
                .HasKey(l => l.Id);
        }
    }
}`
    },
    {
      name: 'Web.config',
      path: 'DSAC.Web/Web.config',
      category: 'Config',
      language: 'xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<!--
  Department of Sport, Arts and Culture (DSAC) - ASP.NET MVC 5 & Web API 2 Configuration
  Public Entities Reporting System (PERS)
  Target Framework: .NET Framework 4.7.2 / IIS / SQL Server
-->
<configuration>
  <configSections>
    <section name="entityFramework" 
             type="System.Data.Entity.Internal.ConfigFile.EntityFrameworkSection, EntityFramework, Version=6.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089" 
             requirePermission="false" />
  </configSections>

  <connectionStrings>
    <!-- Production SQL Server / LocalDB Enterprise Connection String -->
    <add name="DSACConnection" 
         connectionString="Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=DSAC_GovTech_2026_DB;Integrated Security=True;MultipleActiveResultSets=True;App=DSACReportingSystem" 
         providerName="System.Data.SqlClient" />
  </connectionStrings>

  <appSettings>
    <add key="webpages:Version" value="3.0.0.0" />
    <add key="webpages:Enabled" value="false" />
    <add key="ClientValidationEnabled" value="true" />
    <add key="UnobtrusiveJavaScriptEnabled" value="true" />
    <!-- Government Department Settings -->
    <add key="DepartmentName" value="Department of Sport, Arts and Culture" />
    <add key="CurrentReportingPeriod" value="2025/2026 Q3" />
    <add key="DeadlineDaysNotice" value="15" />
  </appSettings>

  <system.web>
    <compilation debug="true" targetFramework="4.7.2" />
    <httpRuntime targetFramework="4.7.2" maxRequestLength="51200" enableVersionHeader="false" />
    <authentication mode="Forms">
      <forms loginUrl="~/Account/Login" timeout="2880" slidingExpiration="true" requireSSL="true" />
    </authentication>
  </system.web>

  <system.webServer>
    <modules runAllManagedModulesForAllRequests="true" />
    <handlers>
      <remove name="ExtensionlessUrlHandler-Integrated-4.0" />
      <remove name="OPTIONSVerbHandler" />
      <remove name="TRACEVerbHandler" />
      <add name="ExtensionlessUrlHandler-Integrated-4.0" path="*." verb="*" type="System.Web.Handlers.TransferRequestHandler" preCondition="integratedMode,runtimeVersionv4.0" />
    </handlers>
    <httpProtocol>
      <customHeaders>
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-Frame-Options" value="SAMEORIGIN" />
        <add name="X-XSS-Protection" value="1; mode=block" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>

  <entityFramework>
    <defaultConnectionFactory type="System.Data.Entity.Infrastructure.LocalDbConnectionFactory, EntityFramework">
      <parameters>
        <parameter value="mssqllocaldb" />
      </parameters>
    </defaultConnectionFactory>
    <providers>
      <provider invariantName="System.Data.SqlClient" type="System.Data.Entity.SqlServer.SqlProviderServices, EntityFramework.SqlServer" />
    </providers>
  </entityFramework>
</configuration>`
    },
    {
      name: 'WebApiConfig.cs',
      path: 'DSAC.Web/App_Start/WebApiConfig.cs',
      category: 'Config',
      language: 'csharp',
      content: `using System.Web.Http;
using System.Web.Http.Cors;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace DSAC.Web
{
    /// <summary>
    /// ASP.NET Web API 2 Route Registration and JSON Formatter Configuration
    /// </summary>
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services
            var cors = new EnableCorsAttribute("*", "*", "*");
            config.EnableCors(cors);

            // Web API attribute routing
            config.MapHttpAttributeRoutes();

            // Web API conventional routing
            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            // Configure JSON Formatter for clean camelCase REST contracts
            var jsonFormatter = config.Formatters.JsonFormatter;
            jsonFormatter.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
            jsonFormatter.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
            jsonFormatter.SerializerSettings.DateTimeZoneHandling = DateTimeZoneHandling.Utc;

            // Remove XML formatter to default to JSON
            config.Formatters.Remove(config.Formatters.XmlFormatter);
        }
    }
}`
    },
    {
      name: 'PublicEntity.cs',
      path: 'DSAC.Domain/Entities/PublicEntity.cs',
      category: 'Models',
      language: 'csharp',
      content: `using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DSAC.Domain.Entities
{
    [Table("DSAC_PublicEntities", Schema = "dbo")]
    public class PublicEntity
    {
        public PublicEntity()
        {
            KPIs = new HashSet<KPI>();
            StatutoryReports = new HashSet<StatutoryReport>();
            DocumentRecords = new HashSet<DocumentRecord>();
            FinancialRecords = new HashSet<FinancialRecord>();
            AuditFindings = new HashSet<AuditFinding>();
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(20)]
        [Index("IX_PublicEntity_Acronym", IsUnique = true)]
        public string Acronym { get; set; }

        [Required]
        [StringLength(250)]
        public string Name { get; set; }

        [Required]
        [StringLength(50)]
        public string RegistrationNumber { get; set; }

        [Required]
        [StringLength(100)]
        public string Category { get; set; } // e.g. Performing Arts Council, Heritage, Film

        [Required]
        [StringLength(100)]
        public string Province { get; set; }

        [Required]
        [StringLength(150)]
        public string CeoName { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(150)]
        public string ContactEmail { get; set; }

        [Required]
        public decimal BudgetAllocated { get; set; }

        [Required]
        public decimal BudgetSpent { get; set; }

        [Required]
        public decimal ComplianceRate { get; set; }

        [Required]
        [StringLength(30)]
        public string RiskLevel { get; set; } // Low, Medium, High

        public int RiskScore { get; set; } // 0 to 100

        [StringLength(500)]
        public string RiskReason { get; set; }

        public int OpenAuditFindings { get; set; }
        public int MissedDeadlinesCount { get; set; }

        public int JobsTarget { get; set; }
        public int JobsCreated { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // EF6 Navigation Properties
        public virtual ICollection<KPI> KPIs { get; set; }
        public virtual ICollection<StatutoryReport> StatutoryReports { get; set; }
        public virtual ICollection<DocumentRecord> DocumentRecords { get; set; }
        public virtual ICollection<FinancialRecord> FinancialRecords { get; set; }
        public virtual ICollection<AuditFinding> AuditFindings { get; set; }
    }
}`
    },
    {
      name: 'EntitiesApiController.cs',
      path: 'DSAC.Web/Controllers/Api/EntitiesApiController.cs',
      category: 'Controllers',
      language: 'csharp',
      content: `using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using DSAC.Data;
using DSAC.Domain.Entities;

namespace DSAC.Web.Controllers.Api
{
    /// <summary>
    /// ASP.NET Web API 2 Controller: Statutory Public Entities Management
    /// RESTful endpoints consumed by MVC Razor Views, AJAX and AI Intelligence Engine
    /// </summary>
    [RoutePrefix("api/entities")]
    public class EntitiesApiController : ApiController
    {
        private readonly DSACDbContext _db = new DSACDbContext();

        // GET: api/entities
        [HttpGet]
        [Route("")]
        public async Task<IHttpActionResult> GetAllEntities(string category = null, string risk = null)
        {
            var query = _db.PublicEntities.AsNoTracking().AsQueryable();

            if (!string.IsNullOrEmpty(category) && category != "All")
            {
                query = query.Where(e => e.Category == category);
            }

            if (!string.IsNullOrEmpty(risk) && risk != "All")
            {
                query = query.Where(e => e.RiskLevel == risk);
            }

            var results = await query.OrderBy(e => e.Name).ToListAsync();
            return Ok(results);
        }

        // GET: api/entities/5
        [HttpGet]
        [Route("{id:int}")]
        [ResponseType(typeof(PublicEntity))]
        public async Task<IHttpActionResult> GetEntityById(int id)
        {
            var entity = await _db.PublicEntities
                .Include(e => e.KPIs)
                .Include(e => e.DocumentRecords)
                .Include(e => e.FinancialRecords)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (entity == null)
            {
                return NotFound();
            }

            return Ok(entity);
        }

        // GET: api/entities/5/risk-profile
        [HttpGet]
        [Route("{id:int}/risk-profile")]
        public async Task<IHttpActionResult> GetEntityRiskProfile(int id)
        {
            var entity = await _db.PublicEntities.FindAsync(id);
            if (entity == null) return NotFound();

            var kpis = await _db.KPIs.Where(k => k.EntityId == id).ToListAsync();
            var totalKpiCount = kpis.Count;
            var atRiskKpis = kpis.Count(k => k.Status == "At Risk" || k.PercentageAchieved < 60);

            var riskAnalysis = new
            {
                EntityId = entity.Id,
                EntityName = entity.Name,
                RiskScore = entity.RiskScore,
                RiskLevel = entity.RiskLevel,
                RiskReason = entity.RiskReason,
                ComplianceRate = entity.ComplianceRate,
                OpenAuditFindings = entity.OpenAuditFindings,
                HistoricalMissedDeadlines = entity.MissedDeadlinesCount,
                AtRiskKpiCount = atRiskKpis,
                KpisTotal = totalKpiCount
            };

            return Ok(riskAnalysis);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}`
    },
    {
      name: 'Configuration.cs',
      path: 'DSAC.Data/Migrations/Configuration.cs',
      category: 'Migrations',
      language: 'csharp',
      content: `using System;
using System.Data.Entity.Migrations;
using System.Linq;
using DSAC.Domain.Entities;

namespace DSAC.Data.Migrations
{
    /// <summary>
    /// Entity Framework 6 Code First Migrations Seed Configuration
    /// Populates the 26 statutory DSAC Public Entities and initial baseline data
    /// </summary>
    internal sealed class Configuration : DbMigrationsConfiguration<DSAC.Data.DSACDbContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = true;
            AutomaticMigrationDataLossAllowed = false;
        }

        protected override void Seed(DSAC.Data.DSACDbContext context)
        {
            // Seed 26 Statutory Public Entities if database is fresh
            if (!context.PublicEntities.Any())
            {
                context.PublicEntities.AddOrUpdate(e => e.Acronym,
                    new PublicEntity {
                        Acronym = "NAC",
                        Name = "National Arts Council of South Africa",
                        RegistrationNumber = "PFMA-SCH3A-001",
                        Category = "Arts & Culture Development",
                        Province = "Gauteng",
                        CeoName = "Dr. Bongani Tembe",
                        ContactEmail = "info@nac.org.za",
                        BudgetAllocated = 145000000m,
                        BudgetSpent = 60900000m,
                        ComplianceRate = 42,
                        RiskLevel = "High",
                        RiskScore = 78,
                        RiskReason = "Current KPI progress is below the expected trajectory (42% vs 75%) and reporting deadline is approaching in 10 days.",
                        OpenAuditFindings = 3,
                        MissedDeadlinesCount = 3,
                        JobsTarget = 2400,
                        JobsCreated = 1150
                    },
                    new PublicEntity {
                        Acronym = "MTF",
                        Name = "Market Theatre Foundation",
                        RegistrationNumber = "PFMA-SCH3A-002",
                        Category = "Performing Arts Council",
                        Province = "Gauteng",
                        CeoName = "Ms. Greg Homann",
                        ContactEmail = "admin@markettheatre.co.za",
                        BudgetAllocated = 78000000m,
                        BudgetSpent = 58500000m,
                        ComplianceRate = 88,
                        RiskLevel = "Low",
                        RiskScore = 18,
                        RiskReason = "On track across all statutory indicators with satisfactory financial burn rate.",
                        OpenAuditFindings = 0,
                        MissedDeadlinesCount = 0,
                        JobsTarget = 850,
                        JobsCreated = 790
                    },
                    new PublicEntity {
                        Acronym = "RIM",
                        Name = "Robben Island Museum",
                        RegistrationNumber = "PFMA-SCH3A-006",
                        Category = "Heritage & Museums",
                        Province = "Western Cape",
                        CeoName = "Ms. Abigail Sithole",
                        ContactEmail = "info@robben-island.org.za",
                        BudgetAllocated = 135000000m,
                        BudgetSpent = 101250000m,
                        ComplianceRate = 84,
                        RiskLevel = "Low",
                        RiskScore = 22,
                        RiskReason = "Satisfactory heritage site operations, clean audit trajectory.",
                        OpenAuditFindings = 0,
                        MissedDeadlinesCount = 0,
                        JobsTarget = 1100,
                        JobsCreated = 980
                    }
                    // Additional 23 entities configured in seed dataset
                );

                context.SaveChanges();
            }
        }
    }
}`
    },
    {
      name: 'Package Manager Commands',
      path: 'Visual Studio / Package Manager Console',
      category: 'Commands',
      language: 'shell',
      content: `# ====================================================================
# Department of Sport, Arts and Culture (DSAC) - Solution Setup
# Target: ASP.NET MVC 5, Web API 2, EF 6, .NET Framework 4.7.2
# ====================================================================

# 1. Install Entity Framework 6.4.4
Install-Package EntityFramework -Version 6.4.4

# 2. Install ASP.NET Web API 2 & MVC 5 Core Packages
Install-Package Microsoft.AspNet.WebApi -Version 5.2.7
Install-Package Microsoft.AspNet.WebApi.Cors -Version 5.2.7
Install-Package Microsoft.AspNet.Mvc -Version 5.2.7

# 3. Install Newtonsoft.Json for API Serialization
Install-Package Newtonsoft.Json -Version 13.0.3

# 4. Enable Entity Framework 6 Code First Migrations
Enable-Migrations -ProjectName DSAC.Data -StartupProjectName DSAC.Web

# 5. Add Initial Baseline Migration
Add-Migration InitialDSACSchema -ProjectName DSAC.Data -StartupProjectName DSAC.Web

# 6. Apply Schema and Seed Data to SQL Server
Update-Database -ProjectName DSAC.Data -StartupProjectName DSAC.Web -Verbose`
    }
  ];

  const [activeFile, setActiveFile] = useState<CodeFile>(codeFiles[0]);

  const copyCode = (text: string, path: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Visual Studio C# & EF6 Backend Architecture Specifications
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Production Enterprise Architecture: C#, ASP.NET MVC 5, Web API 2, EF6 Code First, and Microsoft SQL Server
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded font-mono font-bold border border-purple-500/30">
            .NET Framework 4.7.2
          </span>
          <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded font-mono font-bold border border-emerald-500/30">
            EF 6.4.4 Code First
          </span>
        </div>
      </div>

      {/* Explorer Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Solution Tree */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow space-y-3">
          <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
            <Folder className="w-4 h-4 text-amber-400" />
            <span>Solution 'DSACReportingSystem.sln'</span>
          </div>

          <div className="space-y-1">
            {codeFiles.map(file => {
              const isActive = activeFile.path === file.path;

              return (
                <button
                  key={file.path}
                  onClick={() => setActiveFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-purple-900/60 text-purple-200 border border-purple-500/50 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                    <span className="truncate">{file.name}</span>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">
                    {file.category}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Phase 2 Architecture Summary:</div>
            <div>• Database: SQL Server with EF6 Code First</div>
            <div>• Web UI: ASP.NET MVC 5 Razor (.cshtml)</div>
            <div>• Services: ASP.NET Web API 2 RESTful</div>
          </div>
        </div>

        {/* Code Viewer */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow flex flex-col">
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-300">{activeFile.path}</span>
            </div>

            <button
              onClick={() => copyCode(activeFile.content, activeFile.path)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-xs transition-colors border border-slate-700"
            >
              {copiedPath === activeFile.path ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Copy C# Code</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[550px] bg-slate-950">
            <code>{activeFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
