import { Controller, Get, Logger, Post, Req } from '@nestjs/common';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { Request } from 'express';
import { AppGateway } from './app.gateway';
import { AppService } from './app.service';
import { FirebaseProviderService } from './firebase/provider.service';

const UHI_ENDPOINT = 'http://121.242.73.120:8083/api/v1';
const HSPA_FALLBACK_ENDPOINT = 'http://121.242.73.124:8084/api/v1';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly appGateway: AppGateway,
    private readonly firebaseProvider: FirebaseProviderService,
  ) {}

  private logger: Logger = new Logger();
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  callBack(req: Request, onSuccess?: (data) => void) {
    try {
      const body = req.body;
      console.log(req.headers.location);
      this.logger.log(`Origin: ${req.headers.origin}`);
      this.logger.log(`Message id: ${body.context.message_id}`);
      console.log(body);
      this.appGateway.server.emit(body.context.message_id, body);
      if (onSuccess) {
        onSuccess(body);
      }
      return {
        message: {
          ack: {
            status: 'ACK',
          },
        },
        error: null,
      };
    } catch (error) {
      return {
        message: {
          ack: {
            status: 'NACK',
          },
        },
        error: 'failed',
      };
    }
  }

  @Post('/on_search')
  onSearch(@Req() req: Request) {
    this.callBack(req);
  }

  @Post('/on_init')
  onInit(@Req() req: Request) {
    this.callBack(req);
  }

  @Post('/on_confirm')
  onConfirm(@Req() req: Request) {
    const onSuccess = (data) => {
      const firestore = this.firebaseProvider.firestore;
      firestore.collection('appointments').doc().create(data);
    };
    this.callBack(req, onSuccess);
  }
  @Post('/on_status')
  onStatus(@Req() req: Request) {
    this.callBack(req);
  }

  @Post('/search')
  async search(@Req() req: Request) {
    const context = req.body.context;

    if (context.provider_uri) {
      console.log('in provider uri');
      return await this.callHspa(req, 'search');
    }
    try {
      const config: AxiosRequestConfig = {
        method: 'post',
        data: JSON.stringify(req.body),
        baseURL: UHI_ENDPOINT,
        headers: {
          'Content-Type': 'application/json',
          'X-Gateway-Authorization': 'value',
        },
        url: 'search',
      };
      const response = await axios(config);
      // console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  async callHspa(req: Request, path: string) {
    try {
      const config: AxiosRequestConfig = {
        method: 'post',
        data: req.body,
        baseURL: req.body.context.provider_uri,
        headers: {
          'Content-Type': 'application/json',
        },
        url: path,
      };
      const response = await axios(config);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.message);
        if (error.code === 'ETIMEDOUT') {
          //try fallback url
          const config: AxiosRequestConfig = {
            method: 'post',
            data: JSON.stringify(req.body),
            baseURL: HSPA_FALLBACK_ENDPOINT, //as there may be hspa with unimplemented init(for hackathon), then fallback to the provided hspa uri
            headers: {
              'Content-Type': 'application/json',
            },
            url: path,
          };
          const response = await axios(config);

          return response.data;
        }
      }
    }
  }
  @Post('/init')
  async init(@Req() req: Request) {
    return await this.callHspa(req, 'init');
  }

  @Post('/confirm')
  async confirm(@Req() req: Request) {
    return await this.callHspa(req, 'confirm');
  }
}
