import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import QuestionnairesPage from './QuestionnairesPage';
import MorePage from './MorePage';
import { AuthProvider } from '../../providers/AuthProvider';
import { THEMES } from '../../data/themes';
import type { Account, PersonalPackingItem, Trip } from '../../types/wellsChaos';

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

describe('Personal Packing Items', () => {
  it('renders the personal packing section with items', () => {
    const personalItems: PersonalPackingItem[] = [
      { id: 'p1', item: 'My headphones', packed: false },
      { id: 'p2', item: 'My medication', packed: true },
    ];

    render(
      <MorePage
        trip={mockTrip}
        currentUser={userAccount}
        accounts={accounts}
        theme={theme}
        packingList={[]}
        budgetItems={[]}
        personalPackingItems={personalItems}
        onUpdatePackingList={() => {}}
        onUpdateBudgetItems={() => {}}
        onAddPersonalItem={() => {}}
        onTogglePersonalItem={() => {}}
        onDeletePersonalItem={() => {}}
      />
    );

    // Personal packing section should be visible
    const section = screen.getByTestId('personal-packing-section');
    expect(section).toBeInTheDocument();

    // Items should be rendered
    expect(screen.getByText('My headphones')).toBeInTheDocument();
    expect(screen.getByText('My medication')).toBeInTheDocument();
  });

  it('calls onAddPersonalItem when adding a new personal item', async () => {
    const user = userEvent.setup();
    const onAddPersonalItem = vi.fn();

    render(
      <MorePage
        trip={mockTrip}
        currentUser={userAccount}
        accounts={accounts}
        theme={theme}
        packingList={[]}
        budgetItems={[]}
        personalPackingItems={[]}
        onUpdatePackingList={() => {}}
        onUpdateBudgetItems={() => {}}
        onAddPersonalItem={onAddPersonalItem}
        onTogglePersonalItem={() => {}}
        onDeletePersonalItem={() => {}}
      />
    );

    const input = screen.getByTestId('personal-item-input');
    await user.type(input, 'My sunglasses');

    const addButton = screen.getByTestId('personal-item-add');
    await user.click(addButton);

    expect(onAddPersonalItem).toHaveBeenCalledWith('My sunglasses');
  });

  it('calls onTogglePersonalItem when toggling a personal item', async () => {
    const user = userEvent.setup();
    const onTogglePersonalItem = vi.fn();

    const personalItems: PersonalPackingItem[] = [
      { id: 'p1', item: 'My headphones', packed: false },
    ];

    render(
      <MorePage
        trip={mockTrip}
        currentUser={userAccount}
        accounts={accounts}
        theme={theme}
        packingList={[]}
        budgetItems={[]}
        personalPackingItems={personalItems}
        onUpdatePackingList={() => {}}
        onUpdateBudgetItems={() => {}}
        onAddPersonalItem={() => {}}
        onTogglePersonalItem={onTogglePersonalItem}
        onDeletePersonalItem={() => {}}
      />
    );

    const toggleButton = screen.getByTestId('personal-item-toggle-p1');
    await user.click(toggleButton);

    expect(onTogglePersonalItem).toHaveBeenCalledWith('p1');
  });

  it('calls onDeletePersonalItem when deleting a personal item', async () => {
    const user = userEvent.setup();
    const onDeletePersonalItem = vi.fn();

    const personalItems: PersonalPackingItem[] = [
      { id: 'p1', item: 'My headphones', packed: false },
    ];

    render(
      <MorePage
        trip={mockTrip}
        currentUser={userAccount}
        accounts={accounts}
        theme={theme}
        packingList={[]}
        budgetItems={[]}
        personalPackingItems={personalItems}
        onUpdatePackingList={() => {}}
        onUpdateBudgetItems={() => {}}
        onAddPersonalItem={() => {}}
        onTogglePersonalItem={() => {}}
        onDeletePersonalItem={onDeletePersonalItem}
      />
    );

    const deleteButton = screen.getByTestId('personal-item-delete-p1');
    await user.click(deleteButton);

    expect(onDeletePersonalItem).toHaveBeenCalledWith('p1');
  });

  it('shows combined progress of shared + personal items', () => {
    const sharedItems = [
      { id: 's1', item: 'Sunscreen', packed: true, addedBy: 'ben' },
      { id: 's2', item: 'Snacks', packed: false, addedBy: 'ben' },
    ];
    const personalItems: PersonalPackingItem[] = [
      { id: 'p1', item: 'My headphones', packed: true },
    ];

    render(
      <MorePage
        trip={mockTrip}
        currentUser={userAccount}
        accounts={accounts}
        theme={theme}
        packingList={sharedItems}
        budgetItems={[]}
        personalPackingItems={personalItems}
        onUpdatePackingList={() => {}}
        onUpdateBudgetItems={() => {}}
        onAddPersonalItem={() => {}}
        onTogglePersonalItem={() => {}}
        onDeletePersonalItem={() => {}}
      />
    );

    // Progress should show 2/3 (1 shared packed + 1 personal packed out of 2 shared + 1 personal)
    expect(screen.getByText('67%')).toBeInTheDocument();
    expect(screen.getByText('2/3')).toBeInTheDocument();
  });
});
