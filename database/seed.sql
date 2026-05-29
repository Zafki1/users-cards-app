USE UsersCardsApp;
GO

DELETE FROM dbo.Cards;
DELETE FROM dbo.Users;
GO

INSERT INTO dbo.Users (FullName, BirthDate, WorkPlace)
VALUES
    (N'Алексеева Марина Олеговна', '1991-03-18', N'ООО "Северные Решения"'),
    (N'Кузнецов Артем Викторович', '1987-11-06', N'АО "Технопарк Нева"'),
    (N'Смирнова Елена Павловна', '1995-07-24', N'ООО "Финансовые Сервисы Плюс"'),
    (N'Орлов Дмитрий Андреевич', '1990-01-31', N'ЗАО "Логистика Регион"'),
    (N'Михайлова Софья Ильинична', '1998-09-12', N'ООО "Медлайн Консалт"');

INSERT INTO dbo.Cards (UserId, AccountNumber, OwnerNameLatin, ExpirationDate, Cvc)
VALUES
    ((SELECT Id FROM dbo.Users WHERE FullName = N'Алексеева Марина Олеговна'), N'40817810945230014567', N'MARINA ALEKSEEVA', '2028-08-31', N'274'),
    ((SELECT Id FROM dbo.Users WHERE FullName = N'Алексеева Марина Олеговна'), N'40817810700451239018', N'MARINA ALEKSEEVA', '2029-02-28', N'619'),
    ((SELECT Id FROM dbo.Users WHERE FullName = N'Кузнецов Артем Викторович'), N'40817810331874006251', N'ARTEM KUZNETSOV', '2027-12-31', N'805'),
    ((SELECT Id FROM dbo.Users WHERE FullName = N'Смирнова Елена Павловна'), N'40817810679001834529', N'ELENA SMIRNOVA', '2030-04-30', N'143'),
    ((SELECT Id FROM dbo.Users WHERE FullName = N'Орлов Дмитрий Андреевич'), N'40817810456278193004', N'DMITRY ORLOV', '2028-11-30', N'392'),
    ((SELECT Id FROM dbo.Users WHERE FullName = N'Орлов Дмитрий Андреевич'), N'40817810008463917245', N'DMITRY ORLOV', '2029-07-31', N'057'),
    ((SELECT Id FROM dbo.Users WHERE FullName = N'Михайлова Софья Ильинична'), N'40817810823160958473', N'SOFIA MIKHAILOVA', '2027-05-31', N'731');
GO
