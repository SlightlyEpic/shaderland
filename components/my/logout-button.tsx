import { Button } from '../ui/button';

export default function LogoutButton() {
    return (
        <a href='/api/auth/logout'>
            <Button>Log out</Button>
        </a>
    )
}
