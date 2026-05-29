import { sql, getPool } from '../db/pool.js';

export type CardPayload = {
  accountNumber: string;
  ownerNameLatin: string;
  expirationDate: string;
  cvc: string;
};

export type UserPayload = {
  fullName: string;
  birthDate: string;
  workPlace?: string | null;
  cards: CardPayload[];
};

function mapUser(row: any) {
  return {
    id: row.Id,
    fullName: row.FullName,
    birthDate: row.BirthDate?.toISOString?.().slice(0, 10) ?? row.BirthDate,
    workPlace: row.WorkPlace,
    cardsCount: row.CardsCount,
    createdAt: row.CreatedAt,
    updatedAt: row.UpdatedAt
  };
}

function mapCard(row: any) {
  return {
    id: row.Id,
    userId: row.UserId,
    accountNumber: row.AccountNumber,
    ownerNameLatin: row.OwnerNameLatin,
    expirationDate: row.ExpirationDate?.toISOString?.().slice(0, 10) ?? row.ExpirationDate,
    cvc: row.Cvc,
    createdAt: row.CreatedAt,
    updatedAt: row.UpdatedAt
  };
}

export async function listUsers() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT
      u.Id,
      u.FullName,
      u.BirthDate,
      u.WorkPlace,
      u.CreatedAt,
      u.UpdatedAt,
      COUNT(c.Id) AS CardsCount
    FROM dbo.Users u
    LEFT JOIN dbo.Cards c ON c.UserId = u.Id
    GROUP BY u.Id, u.FullName, u.BirthDate, u.WorkPlace, u.CreatedAt, u.UpdatedAt
    ORDER BY u.FullName ASC
  `);

  return result.recordset.map(mapUser);
}

export async function getUserById(id: number) {
  const pool = await getPool();
  const userResult = await pool.request()
    .input('id', sql.Int, id)
    .query(`
      SELECT Id, FullName, BirthDate, WorkPlace, CreatedAt, UpdatedAt
      FROM dbo.Users
      WHERE Id = @id
    `);

  const user = userResult.recordset[0];
  if (!user) {
    return null;
  }

  const cardsResult = await pool.request()
    .input('userId', sql.Int, id)
    .query(`
      SELECT Id, UserId, AccountNumber, OwnerNameLatin, ExpirationDate, Cvc, CreatedAt, UpdatedAt
      FROM dbo.Cards
      WHERE UserId = @userId
      ORDER BY Id ASC
    `);

  return {
    ...mapUser(user),
    cards: cardsResult.recordset.map(mapCard)
  };
}

export async function createUser(payload: UserPayload) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  await transaction.begin();

  try {
    const userResult = await new sql.Request(transaction)
      .input('fullName', sql.NVarChar(255), payload.fullName)
      .input('birthDate', sql.Date, payload.birthDate)
      .input('workPlace', sql.NVarChar(255), payload.workPlace || null)
      .query(`
        INSERT INTO dbo.Users (FullName, BirthDate, WorkPlace)
        OUTPUT INSERTED.Id
        VALUES (@fullName, @birthDate, @workPlace)
      `);

    const userId = userResult.recordset[0].Id as number;

    for (const card of payload.cards) {
      await new sql.Request(transaction)
        .input('userId', sql.Int, userId)
        .input('accountNumber', sql.NVarChar(50), card.accountNumber)
        .input('ownerNameLatin', sql.NVarChar(255), card.ownerNameLatin)
        .input('expirationDate', sql.Date, card.expirationDate)
        .input('cvc', sql.NVarChar(4), card.cvc)
        .query(`
          INSERT INTO dbo.Cards (UserId, AccountNumber, OwnerNameLatin, ExpirationDate, Cvc)
          VALUES (@userId, @accountNumber, @ownerNameLatin, @expirationDate, @cvc)
        `);
    }

    await transaction.commit();
    return getUserById(userId);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function updateUser(id: number, payload: UserPayload) {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  await transaction.begin();

  try {
    const updateResult = await new sql.Request(transaction)
      .input('id', sql.Int, id)
      .input('fullName', sql.NVarChar(255), payload.fullName)
      .input('birthDate', sql.Date, payload.birthDate)
      .input('workPlace', sql.NVarChar(255), payload.workPlace || null)
      .query(`
        UPDATE dbo.Users
        SET FullName = @fullName,
            BirthDate = @birthDate,
            WorkPlace = @workPlace,
            UpdatedAt = SYSUTCDATETIME()
        WHERE Id = @id
      `);

    if (updateResult.rowsAffected[0] === 0) {
      await transaction.rollback();
      return null;
    }

    await new sql.Request(transaction)
      .input('userId', sql.Int, id)
      .query('DELETE FROM dbo.Cards WHERE UserId = @userId');

    for (const card of payload.cards) {
      await new sql.Request(transaction)
        .input('userId', sql.Int, id)
        .input('accountNumber', sql.NVarChar(50), card.accountNumber)
        .input('ownerNameLatin', sql.NVarChar(255), card.ownerNameLatin)
        .input('expirationDate', sql.Date, card.expirationDate)
        .input('cvc', sql.NVarChar(4), card.cvc)
        .query(`
          INSERT INTO dbo.Cards (UserId, AccountNumber, OwnerNameLatin, ExpirationDate, Cvc)
          VALUES (@userId, @accountNumber, @ownerNameLatin, @expirationDate, @cvc)
        `);
    }

    await transaction.commit();
    return getUserById(id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function deleteUser(id: number) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('DELETE FROM dbo.Users WHERE Id = @id');

  return result.rowsAffected[0] > 0;
}
