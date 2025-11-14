import { createRoute } from '@tanstack/react-router';
import { Route as RootRoute } from './__root';
import { MainLayout } from '../components/Layout/MainLayout';
import { TreeView } from '../components/TreeView/TreeView';
import { CardEditor } from '../components/CardEditor/CardEditor';
import { LinkPanel } from '../components/LinkPanel/LinkPanel';

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/',
  component: IndexComponent,
});

function IndexComponent() {
  return (
    <MainLayout
      treePanel={<TreeView />}
      editorPanel={<CardEditor />}
      linksPanel={<LinkPanel />}
    />
  );
}
