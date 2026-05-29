-- Use this script when the database already exists.
-- Open the target database in SSMS/Azure Data Studio and run this script there.

IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        FullName NVARCHAR(255) NOT NULL,
        BirthDate DATE NOT NULL,
        WorkPlace NVARCHAR(255) NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NULL
    );
END
GO

IF OBJECT_ID(N'dbo.Cards', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Cards (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        UserId INT NOT NULL,
        AccountNumber NVARCHAR(50) NOT NULL,
        OwnerNameLatin NVARCHAR(255) NOT NULL,
        ExpirationDate DATE NOT NULL,
        Cvc NVARCHAR(4) NOT NULL,
        CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Cards_CreatedAt DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_Cards_Users FOREIGN KEY (UserId)
            REFERENCES dbo.Users(Id)
            ON DELETE CASCADE
    );
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = N'IX_Cards_UserId'
      AND object_id = OBJECT_ID(N'dbo.Cards')
)
BEGIN
    CREATE INDEX IX_Cards_UserId ON dbo.Cards(UserId);
END
GO

