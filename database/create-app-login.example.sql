-- Run this script from an administrator account if you want to create a SQL login for the app.
-- Change the login name and password before running it.

USE master;
GO

IF NOT EXISTS (SELECT 1 FROM sys.sql_logins WHERE name = N'users_cards_app_user')
BEGIN
    CREATE LOGIN users_cards_app_user
        WITH PASSWORD = 'ChangeThisPassword123!',
        CHECK_POLICY = ON;
END
GO

USE UsersCardsApp;
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'users_cards_app_user')
BEGIN
    CREATE USER users_cards_app_user FOR LOGIN users_cards_app_user;
END
GO

ALTER ROLE db_datareader ADD MEMBER users_cards_app_user;
ALTER ROLE db_datawriter ADD MEMBER users_cards_app_user;
GO

