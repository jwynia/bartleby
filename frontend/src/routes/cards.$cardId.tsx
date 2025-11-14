import { createRoute } from '@tanstack/react-router';
import { Route as RootRoute } from './__root';
import { MainLayout } from '../components/Layout/MainLayout';
import { TreeView } from '../components/TreeView/TreeView';
import { CardEditor } from '../components/CardEditor/CardEditor';
import { LinkPanel } from '../components/LinkPanel/LinkPanel';
import { useTreeStore } from '../stores/treeStore';
import { useEffect } from 'react';

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/cards/$cardId',
  component: CardDetailComponent,
});

function CardDetailComponent() {
  const { cardId } = Route.useParams();
  const { setSelected } = useTreeStore();

  // Synchronize URL param with tree selection
  useEffect(() => {
    if (cardId) {
      setSelected(cardId);
    }
  }, [cardId, setSelected]);

  return (
    <MainLayout
      treePanel={<TreeView />}
      editorPanel={<CardEditor />}
      linksPanel={<LinkPanel />}
    />
  );
}
