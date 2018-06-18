import { observable } from 'mobx';

export class NavigationTab {
  @observable active: boolean;
  @observable title: string;
  @observable route: string;

  constructor(title: string, route: string, active: boolean) {
    this.title = title;
    this.route = route;
    this.active = active;
  }
}

export class NavigationService {
  @observable tabs: NavigationTab[];

  constructor() {
    this.tabs = [
      new NavigationTab('Test', '/test', true),
      new NavigationTab('Test 2', '/test2', false),
      new NavigationTab('Test 3', '/test3', false)
    ];
  }
}
