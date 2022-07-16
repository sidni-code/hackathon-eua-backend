import { Controller, Get, Logger, Post, Req } from '@nestjs/common';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { Request } from 'express';
import { AppGateway } from './app.gateway';
import { AppService } from './app.service';

const UHI_ENDPOINT = 'http://121.242.73.120:8083/api/v1';
const HSPA_FALLBACK_ENDPOINT = 'http://121.242.73.124:8084/api/v1';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly appGateway: AppGateway,
  ) {}

  private logger: Logger = new Logger();
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  callBack(req: Request) {
    try {
      const body = req.body;
      console.log(req.headers.location);
      this.logger.log(`Origin: ${req.headers.origin}`);
      this.logger.log(`Message id: ${body.context.message_id}`);
      console.log(body);
      this.appGateway.server.emit(body.context.message_id, body);
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
    this.callBack(req);
  }
  @Post('/on_status')
  onStatus(@Req() req: Request) {
    this.callBack(req);
  }

  @Post('/search')
  async search(@Req() req: Request) {
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
        data: JSON.stringify(req.body),
        baseURL: req.body.context.provider_uri,
        headers: {
          'Content-Type': 'application/json',
          'X-Gateway-Authorization': 'value',
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
              'X-Gateway-Authorization': 'value',
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
    await this.callHspa(req, 'init');
  }

  @Post('/confirm')
  async confirm(@Req() req: Request) {
    await this.callHspa(req, 'confirm');
  }
}
