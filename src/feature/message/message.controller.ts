import { Controller } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller({
  version: '1',
  path: "message",
})
export class MessageController {

  constructor(
    private readonly messageService: MessageService
  ) { }

  
}
