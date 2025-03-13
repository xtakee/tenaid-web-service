require('dotenv').config()
import './services/sentry.logger'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import helmet from 'helmet'
import { TransformResponseInterceptor } from './interceptor/transform.response.interceptor'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { HttpExceptionFilter } from './feature/core/exception/http.exception.filter'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { ENV } from './core/util/env'
import * as basicAuth from "express-basic-auth"

async function main() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalInterceptors(new TransformResponseInterceptor())
  app.useGlobalFilters(new HttpExceptionFilter())

  app.useGlobalPipes(new ValidationPipe())

  app.enableVersioning({
    type: VersioningType.URI
  })

  const config = new DocumentBuilder()
    .setTitle('Tenaid Api Documentation')
    .setDescription('Tenaid is a tenant, landlord and property management system')
    .addBearerAuth()
    .setVersion('1.0')
    .build()

  const users = { developer_tenaid: 'developer_2024' }

  const document = SwaggerModule.createDocument(app, config)
  if (process.env.NODE_ENV === ENV.DEV) {

    app.use("/docs", basicAuth({ users, challenge: true }))
    app.use("/docs-json", basicAuth({ users, challenge: true }))

    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  }

  app.use(helmet())
  app.enableCors()

  await app.listen(process.env.PORT)
}

main()  
