import { createFileRoute } from '@tanstack/react-router';
import { MainLayout } from '../components/Layout/MainLayout';
import { TreeView } from '../components/TreeView/TreeView';
import { CardEditor } from '../components/CardEditor/CardEditor';
import { LinkPanel } from '../components/LinkPanel/LinkPanel';

export const Route = createFileRoute('/')({
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
