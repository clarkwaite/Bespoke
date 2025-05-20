import styled from 'styled-components';

export const AppContainer = styled.div`
    display: flex;
    min-height: 100vh;
`;

export const Sidebar = styled.aside`
    width: 175px;
    background-color: #f0f0f0;
    padding: 20px;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    height: 100vh;
`;

export const SidebarNav = styled.nav`
    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    li {
        margin: 10px 0;
    }

    a {
        text-decoration: none;
        color: #333;
        padding: 10px;
        display: block;
        border-radius: 4px;
        transition: background-color 0.2s;

        &:hover {
            background-color: #e0e0e0;
        }

        &.active {
            background-color: #1a3040;
            color: white;
        }
    }
`;

export const MainContent = styled.main`
    flex: 1;
    padding: 20px;
    background-color: #fff;
`;

export const PageHeader = styled.header`
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;

    h1, h2 {
        margin: 0;
        color: #333;
    }
`;
