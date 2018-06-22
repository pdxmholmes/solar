import { observable } from 'mobx';

export class NavigationTab {
  @observable
  public active: boolean;

  @observable
  public title: string;

  @observable
  public route: string;

  constructor(title: string, route: string, active: boolean) {
    this.title = title;
    this.route = route;
    this.active = active;
  }
}

export class NavigationService {
  @observable
  public tabs: NavigationTab[];

  constructor() {
    this.tabs = [
      new NavigationTab('Test', '/test', true),
      new NavigationTab('Test 2', '/test2', false),
      new NavigationTab('Test 3', '/test3', false)
    ];
  }
}
