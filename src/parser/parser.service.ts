import { Injectable } from '@nestjs/common';
import { TemplateDto } from './dto/template.dto';
import { InstanceDto } from './dto/instance.dto';
import { Templates } from '../tables/templates.entity';
import { TemplatesRepository } from '../tables/templates.repository';
import { InstanceRepository } from '../tables/instance.repository';
import { Instance } from '../tables/instance.entity';
import { search } from '@metrichor/jmespath';
import { v4 as uuid } from 'uuid';
import { Console } from 'console';

@Injectable()
export class ParserService {
  constructor(
    private readonly templatesRepository: TemplatesRepository,
    private readonly instanceRepository: InstanceRepository,
  ) {}

  public getInfo(): string {
    return 'VeriDID Worflow Parser service';
  }

  getTemplates(): Promise<Templates[]> {
    return this.templatesRepository.find();
  }

  getTemplate(_templateId: string): Promise<Templates | null > {
    return this.templatesRepository.findOneBy({
      template_id: _templateId
    });
  }

  getState(_template: any, _stateId: string): any {
    return search(_template, "states[?stateId ='" + _stateId + "']");
  }

  getStateTransitions(_template: any, _stateId: string): any {
    return search(_template, "states[?stateId='" + _stateId + "'].transitions");
  }

  getStateAction(_template: any, _stateId: string, _actionId: string): any {
    var action = {}
    for(var i = 0; i < _template?.states.length; i++) {
      console.log("Get State - state=", _template.states[i].stateId);
      if(_template.states[i].stateId === _stateId) {
        for(var j = 0; j < _template.states[i].transitions.length; j++) {
          console.log("Get State - transition=", _template.states[i].transitions[j]);
          if(_template.states[i].transitions[j].actionId === _actionId) {
            console.log("Get State - found=", _template.states[i].transitions[j]);
            action = _template.states[i].transitions[j];
            return action;
          }
        }
      }
    }
    return action;
  }

  getStateDisplay(_template: any, _stateId: string): any {
    var display = {}
    for(var i = 0; i < _template?.states.length; i++) {
      console.log("Get State - state=", _template.states[i].stateId);
      if(_template.states[i].stateId === _stateId) {
        display = _template.states[i].displayData;
        return display;
      }
    }
    return display;
  }

  async getInstance(_instanceDto: InstanceDto): Promise<Instance | null> {
    return await this.instanceRepository.findOneBy({
      template_id: _instanceDto.templateId
    });
  }

  async updateInstance(_instance: Instance): Promise<Instance> {
    return await this.instanceRepository.save(_instance);
  }

  async updateInstanceByDto(
    _instanceDto: InstanceDto,
    _instanceId: string,
  ): Promise<Instance> {
    const instance: Instance = new Instance();
    instance.instance_id = _instanceId;
    instance.template_id = _instanceDto.templateId;
    instance.connection_id = _instanceDto.connectionId;
    instance.state_id = _instanceDto.stateId;
    instance.instance_json = _instanceDto.instanceJson;
    return await this.instanceRepository.save(instance);
  }

  async createInstance(_instanceDto: InstanceDto): Promise<Instance> {
    const instance: Instance = new Instance();
    instance.instance_id = uuid();
    instance.template_id = _instanceDto.templateId;
    instance.connection_id = _instanceDto.connectionId;
    instance.state_id = _instanceDto.stateId;
    instance.instance_json = _instanceDto.instanceJson;
    return await this.instanceRepository.create(instance);
  }

  async parse(
    _templateId: string,
    _connectionId: string,
    _instanceId: string,
    _actionId: string,
    _params: any,
  ): Promise <any> {
    let currentState = '00000000-0000-0000-0000-000000000000';
    let newState = '';
    // Find the instance
    const instanceDto: InstanceDto = new InstanceDto();
    instanceDto.templateId = _templateId;
    instanceDto.connectionId = _connectionId;
    instanceDto.stateId = currentState;
    instanceDto.instanceJson = {};
    console.log("Parser find instance");
    let instance = await this.getInstance(instanceDto);
    // If no instance create one
    console.log("Parser check if instance exists");
    if (instance === null) {
      // Create new instance
      console.log("Parser create new instance");
      instance = await this.createInstance(instanceDto);
    } else {
      // Get the current state from the instance
      console.log("Instance = ", instance);
      console.log("Parser get state from instance");
      currentState = instance.state_id;
    }
    // Find the state
    console.log("Parser get template");
    const template = await this.getTemplate(_templateId);
    console.log("Template is: ", template);
    // Check action to see if need to save data to instance JSON - TBD
    if(typeof _actionId === undefined || _actionId === 'undefined') {
      _actionId === 'NO ACTION';
    }
    console.log("Parser get action for currentState=", currentState, " and ActionID=", _actionId);
    const transition = this.getStateAction(template?.template_json, currentState, _actionId);
    console.log("Parser Transition=", transition)
    // Check the action to see if there is a transition
    if (!(Object.keys(transition).length === 0 && transition.constructor === Object)) {
      console.log("Parser get action type=", transition?.type);
      switch (transition.type) {
        case 'workflow':
          newState = eval(transition['condition'])
            ? transition.value
            : currentState;
          break;
        default:
          newState = currentState;
      }
      // If transition save the new state in the instance
      instance.state_id = newState;
      instance = await this.updateInstance(instance);
    }
    // Return display for state
    console.log("Parser get display data");
    const display = this.getStateDisplay(template?.template_json, currentState);
    console.log("Parser display data =", display);
    return display;
  }
}
