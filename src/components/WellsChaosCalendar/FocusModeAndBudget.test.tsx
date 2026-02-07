import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import QuestionnairesPage from './QuestionnairesPage';
import MorePage from './MorePage';
import { AuthProvider } from '../../providers/AuthProvider';
import { THEMES } from '../../data/themes';
import type { Account, Trip } from '../../types/wellsChaos';

const theme = THEMES.Default;

const adminAccount: Account = {
  username: 'ben',
  password: 'magic2024',
  name: 'Ben',
  role: 'admin',
  defaultAvatar: '👨',
  color: 'blue',
  customAvatar: null,
  theme: 'Default',
};

const userAccount: Account = {
  username: 'rachel',
  password: 'rides4eva',
  name: 'Rachel',
  role: 'user',
  defaultAvatar: '👧',
  color: 'purple',
  customAvatar: null,
  theme: 'Default',
};

const accounts = [adminAccount, userAccount];

const mockTrip: Trip = {
  name: 'Disney 2026',
  members: accounts,
  days: [],
  hotel: null,
  notes: '',
};

describe('Questionnaire Focus Mode', () => {
  it('calls onFocusModeChange(true) when a questionnaire is started', async () => {
    const user = userEvent.setup();
    const onFocusModeChange = vi.fn();

    render(
      <AuthProvider>
        <QuestionnairesPage
          currentUser={userAccount}
          accounts={accounts}
          theme={theme}
          onFocusModeChange={onFocusModeChange}
        />
      </AuthProvider>
    );

    // Click the first questionnaire
    const firstQuestionnaireButton = screen.getAllByRole('button').find(
      (btn) => btn.textContent?.includes('Park Day Adventures')
    );
    expect(firstQuestionnaireButton).toBeTruthy();
    await user.click(firstQuestionnaireButton!);

    // Focus mode should have been activated
    expect(onFocusModeChange).toHaveBeenCalledWith(true);
  });

  it('calls onFocusModeChange(false) when exiting a questionnaire', async () => {
    const user = userEvent.setup();
    const onFocusModeChange = vi.fn();

    render(
      <AuthProvider>
        <QuestionnairesPage
          currentUser={userAccount}
          accounts={accounts}
          theme={theme}
          onFocusModeChange={onFocusModeChange}
        />
      </AuthProvider>
    );

    // Start a questionnaire
    const firstQuestionnaireButton = screen.getAllByRole('button').find(
      (btn) => btn.textContent?.includes('Park Day Adventures')
    );
    await user.click(firstQuestionnaireButton!);

    // Now click the back button to exit
    const backButton = screen.getAllByRole('button')[0]; // ChevronLeft back button
    await user.click(backButton);

    // Focus mode should have been deactivated
    expect(onFocusModeChange).toHaveBeenCalledWith(false);
  });

  it('shows the Next button when questionnaire is active (no BottomNav blocking)', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <QuestionnairesPage
          currentUser={userAccount}
          accounts={accounts}
          theme={theme}
        />
      </AuthProvider>
    );

    // Start a questionnaire
    const firstQuestionnaireButton = screen.getAllByRole('button').find(
      (btn) => btn.textContent?.includes('Park Day Adventures')
    );
    await user.click(firstQuestionnaireButton!);

    // The navigation bar should be present with Next button
    const navBar = screen.getByTestId('questionnaire-nav');
    expect(navBar).toBeInTheDocument();

    const nextButton = screen.getByTestId('questionnaire-next');
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).toBeVisible();
  });
});

describe('Budget Modal Mobile UX', () => {
  it('shows the budget FAB when on budget tab', async () => {
    const user = userEvent.setup();

    render(
      <MorePage
        trip={mockTrip}
        currentUser={adminAccount}
        accounts={accounts}
        theme={theme}
        packingList={[]}
        budgetItems={[]}
        onUpdatePackingList={() => {}}
        onUpdateBudgetItems={() => {}}
      />
    );

    // Click on Budget tab
    const budgetTab = screen.getByText('Budget');
    await user.click(budgetTab);

    // FAB should be visible
    const fab = screen.getByTestId('budget-fab');
    expect(fab).toBeInTheDocument();
    expect(fab).toBeVisible();
  });

  it('opens budget modal with sticky action footer', async () => {
    const user = userEvent.setup();

    render(
      <MorePage
        trip={mockTrip}
        currentUser={adminAccount}
        accounts={accounts}
        theme={theme}
        packingList={[]}
        budgetItems={[]}
        onUpdatePackingList={() => {}}
        onUpdateBudgetItems={() => {}}
      />
    );

    // Switch to Budget tab and open modal
    const budgetTab = screen.getByText('Budget');
    await user.click(budgetTab);

    const fab = screen.getByTestId('budget-fab');
    await user.click(fab);

    // Modal should be visible
    const modal = screen.getByTestId('budget-modal');
    expect(modal).toBeInTheDocument();

    // Sticky footer with actions should be visible
    const actions = screen.getByTestId('budget-modal-actions');
    expect(actions).toBeInTheDocument();
    expect(actions).toBeVisible();

    // Save button should be present
    const saveButton = screen.getByTestId('budget-save');
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeVisible();
  });
});
