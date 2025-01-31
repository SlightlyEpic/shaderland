type RouteParams = {
    id: string,
};

type WorkspacePageProps = {
    params: RouteParams,
};

export default function WorkspacePage({ params }: WorkspacePageProps) {
    return (
        <div>
            Web IDE
        </div>
    )
}
