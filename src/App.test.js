import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import SymplerChat from './index';
test('renders learn react link', function () {
    render(_jsx(SymplerChat, { endpoint: '', formName: '' }));
    var linkElement = screen.getByText(/learn react/i);
    expect(linkElement).toBeInTheDocument();
});
