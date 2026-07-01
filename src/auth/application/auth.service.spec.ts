import {MongoMemoryServer} from "mongodb-memory-server";
import {db} from "../../db/mongo.db";
import {ResultStatus} from "../../core/result/resultCode";
import {addMinutes} from "date-fns";
import {authService, nodemailerService} from "../../composition-root";

describe("integration tests for authService", () => {
  let mongoServer: MongoMemoryServer;
  // Переменная, в которой будем хранить наш временный MongoDB-сервер для тестов.

  beforeAll(async () => {
    // Выполнится один раз перед всеми тестами в этом describe.
    console.log('beforeAll')

    mongoServer = await MongoMemoryServer.create()
    // Создаём временную MongoDB в памяти.
    // Это не реальная база, а отдельная тестовая база.

    const mongoUri = mongoServer.getUri()
    // Получаем адрес подключения к этой временной MongoDB.

    await db.run(mongoUri)
    // Подключаем наш db-клиент к тестовой MongoDB.
  })

  // beforeEach(async () => {
  //   // Выполнится перед каждым отдельным тестом.
  //   // console.log('beforeEach')
  //
  //   await db.drop()
  //   // Очищаем тестовую базу, чтобы каждый тест начинался с пустой БД.
  // })

  afterEach(() => {
    // Выполнится после каждого отдельного теста.
    // console.log('afterEach')

    jest.restoreAllMocks()
    // Возвращаем все замоканные методы в исходное состояние.
    // Например, если sendEmail был заменён на mock, он снова станет настоящим sendEmail.
  })

  afterAll(async () => {
    // Выполнится один раз после всех тестов.
    console.log('afterAll')

    await db.stop()
    // Закрываем соединение нашего приложения с MongoDB.

    await mongoServer.stop()
    // Останавливаем временный MongoDB-сервер.
  })

  describe("register user", () => {

    beforeAll(async () => {
      // Выполнится перед каждым отдельным тестом.
      console.log('beforeAll, register user')

      await db.drop()
      // Очищаем тестовую базу, чтобы каждый тест начинался с пустой БД.
    })

    let userSmtpEmail = 'smtp@anna.com'
    let userSmtpLogin = 'smtp'
    let correctUserEmail = 'anna@anna.com'
    let correctUserLogin = 'Anna'
    let busyUserEmail = correctUserEmail
    let busyUserLogin = correctUserLogin

    it("should send confirmation email after registration", async () => {
      const sendEmailSpy = jest
        .spyOn(nodemailerService, 'sendEmail') // Следи за методом sendEmail внутри объекта nodemailerService.
        .mockResolvedValue(true) // Когда кто-то вызовет nodemailerService.sendEmail(), не выполняй реальную отправку письма, а сразу верни Promise, который успешно завершится значением true.

      await authService.registerUser(userSmtpLogin, userSmtpEmail, '123')

      expect(sendEmailSpy).toHaveBeenCalled()
      expect(sendEmailSpy).toHaveBeenCalledTimes(1)
    })

    it("should return correct created user", async () => {
      jest
        .spyOn(nodemailerService, 'sendEmail')
        .mockResolvedValue(true)

      const result = await authService.registerUser(correctUserLogin, correctUserEmail, '123')

      expect(result.data?.email).toBe(correctUserEmail)
      expect(result.data?.login).toBe(correctUserLogin)
      expect(result.status).toBe(ResultStatus.Success)
      expect(result.data?.emailConfirmation.isConfirmed).toBe(false)
    })

    it("should return null because duplicated email", async () => {
      jest.spyOn(nodemailerService, 'sendEmail').mockResolvedValue(true)

      let login = 'xxx'

      await authService.registerUser(login, busyUserEmail, '123')

      const result = await authService.registerUser('Anna', busyUserEmail, '123')

        expect(result.data).toBeNull()
    })

    it("should return null because duplicated login", async () => {
      jest.spyOn(nodemailerService, 'sendEmail').mockResolvedValue(true)

      let email = 'xxx@xxx.com'

      await authService.registerUser(busyUserLogin, email, '123')

      const result = await authService.registerUser(busyUserLogin, 'anna@anna.com', '123')

        expect(result.data).toBeNull()
    })
  })

  describe("registration Confirmation", () => {

    beforeAll(async () => {
      // Выполнится перед каждым отдельным тестом.
      console.log('beforeAll, registration Confirmation')

      await db.drop()
      // Очищаем тестовую базу, чтобы каждый тест начинался с пустой БД.
    })

    const createUser = (confirmationCode: string, expirationDate: Date, email: string) => {
      return {
        login: 'Anna',
        email: email,
        passwordHash: '',
        createdAt: new Date(),
        emailConfirmation: {
          confirmationCode: confirmationCode,
          isConfirmed: false,
          expirationDate: expirationDate
        }
      }
    }

    it("should return null for expired confirmation code", async () => {
      await db
        .getCollections()
        .userCollection
        .insertOne(
          createUser(
            'superCode',
            addMinutes(new Date(), -1),
            'anna@anna.com'
          )
        )

      const result = await authService.registrationConfirmation('superCode')

      expect(result.data).toBeNull()
      expect(result.status).toBe(ResultStatus.BadRequest)

      const userFromDb = await db.getCollections().userCollection.findOne({email: 'anna@anna.com'})
      expect(userFromDb?.emailConfirmation.isConfirmed).toBe(false)
    })

    it("should return null for not existed confirmation code", async () => {

      const result = await authService.registrationConfirmation('ssssssssssuperCode')

      expect(result.data).toBeNull()
      expect(result.status).toBe(ResultStatus.BadRequest)
    })

    it("should return user for existing and not expired confirmation code", async () => {
      let user = createUser('goodCode', addMinutes(new Date(), 1), 'good-code-user@anna.com')

      await db.getCollections().userCollection.insertOne(user)

      const result = await authService.registrationConfirmation('goodCode')

      expect(result.status).toBe(ResultStatus.Success)
      expect(result.data).not.toBeNull()
      expect(result.data?.login).toBe('Anna')
      expect(result.data?.email).toBe('good-code-user@anna.com')
      expect(result.data?.emailConfirmation.isConfirmed).toBe(true)

      const userFromDb = await db.getCollections().userCollection.findOne({email: 'good-code-user@anna.com'})
      expect(userFromDb?.emailConfirmation.isConfirmed).toBe(true)
    })


  })
})