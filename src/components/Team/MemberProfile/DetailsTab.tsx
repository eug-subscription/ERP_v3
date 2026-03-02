import { useMemo, useRef, useState } from "react";
import {
    Input,
    Label,
    TextField,
    TextArea,
    Select,
    ComboBox,
    ListBox,
    Description,
    FieldError,
    Switch,
    Card,
} from "@heroui/react";
import type { Key } from "@heroui/react";
import { countries } from "../../../constants/countries";
import type {
    SplTeamMemberProfile,
    PersonalInfo,
    ProfileInfo,
} from "../../../types/team-profile";
import { DESCRIPTION_MAX_LENGTH } from "../../../types/team-profile";
import { FormSection } from "./FormSection";
import { FormActionRow } from "./FormSection";
import { FLEX_COL_GAP_4, FORM_GRID_2COL, TEXT_FIELD_LABEL } from "../../../constants/ui-tokens";
import { TIMEZONES } from "../../../constants/timezones";
import { MOCK_API_DELAY } from "../../../constants/query-config";


// ─── Utilities ────────────────────────────────────────────────────────────────

/** Shallow-equal for flat objects with primitive values (e.g. PersonalInfo, ProfileInfo). */
function shallowEqual<T extends object>(a: T, b: T): boolean {
    const keysA = Object.keys(a) as (keyof T)[];
    if (keysA.length !== Object.keys(b).length) return false;
    return keysA.every((k) => (a[k] as unknown) === (b[k] as unknown));
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DetailsTabProps {
    profile: SplTeamMemberProfile;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * DetailsTab — "My Details" tab on the Member Profile page.
 *
 * Two independent FormSection blocks:
 *  1. Personal Info — name, email, phone, country, timezone, avatar (visual)
 *  2. Profile — availability switch, portfolio URL, description with char count
 *
 * Each section tracks its own dirty state and resets independently.
 */
export function DetailsTab({ profile }: DetailsTabProps) {
    // ── Saved baselines — updated on each successful save ──────────────────
    const savedPersonal = useRef<PersonalInfo>(profile.personalInfo);
    const savedProfileInfo = useRef<ProfileInfo>(profile.profileInfo);

    // ── Section 1: Personal Info state ─────────────────────────────────────
    const [personal, setPersonal] = useState<PersonalInfo>(profile.personalInfo);

    const isPersonalDirty = useMemo(
        () => !shallowEqual(personal, savedPersonal.current),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [personal, savedPersonal.current],
    );

    // ── Section 2: Profile Info state ──────────────────────────────────────
    const [profileInfo, setProfileInfo] = useState<ProfileInfo>(
        profile.profileInfo,
    );

    const isProfileDirty = useMemo(
        () => !shallowEqual(profileInfo, savedProfileInfo.current),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [profileInfo, savedProfileInfo.current],
    );

    // ── Combined tab-level state ────────────────────────────────────────────
    const isDirty = isPersonalDirty || isProfileDirty;
    const [isSaving, setIsSaving] = useState(false);

    function handleCancel() {
        setPersonal(savedPersonal.current);
        setProfileInfo(savedProfileInfo.current);
    }

    function handleSave() {
        setIsSaving(true);
        // TODO: trigger toast notification on successful save (deferred until real API integration)
        setTimeout(() => {
            savedPersonal.current = personal;
            savedProfileInfo.current = profileInfo;
            setIsSaving(false);
        }, MOCK_API_DELAY);
    }

    // ── Helpers ────────────────────────────────────────────────────────────
    const charCount = profileInfo.description.length;
    const isOverLimit = charCount > DESCRIPTION_MAX_LENGTH;
    const isEmailInvalid =
        personal.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email);

    return (
        <div className={FLEX_COL_GAP_4}>
            {/* ── Section 1: Personal Info ─────────────────────────────── */}
            <FormSection
                title="Personal info"
                description="Update your photo and personal details."
                isDirty={isPersonalDirty}
                onCancel={handleCancel}
                onSave={handleSave}
                isSaving={isSaving}
                showActions={false}
                isFirst
            >
                <div className={FORM_GRID_2COL}>
                    {/* First name */}
                    <TextField
                        fullWidth
                        isRequired
                        name="firstName"
                        value={personal.firstName}
                        onChange={(v) =>
                            setPersonal((p) => ({ ...p, firstName: v }))
                        }
                    >
                        <Label className={TEXT_FIELD_LABEL}>First name</Label>
                        <Input placeholder="Jane" />
                    </TextField>

                    {/* Last name */}
                    <TextField
                        fullWidth
                        isRequired
                        name="lastName"
                        value={personal.lastName}
                        onChange={(v) =>
                            setPersonal((p) => ({ ...p, lastName: v }))
                        }
                    >
                        <Label className={TEXT_FIELD_LABEL}>Last name</Label>
                        <Input placeholder="Doe" />
                    </TextField>
                </div>

                {/* Email + Phone */}
                <div className={FORM_GRID_2COL}>
                    <TextField
                        fullWidth
                        isRequired
                        isInvalid={isEmailInvalid}
                        name="email"
                        type="email"
                        value={personal.email}
                        onChange={(v) =>
                            setPersonal((p) => ({ ...p, email: v }))
                        }
                    >
                        <Label className={TEXT_FIELD_LABEL}>Email address</Label>
                        <Input placeholder="jane@example.com" />
                        {isEmailInvalid && (
                            <FieldError>Please enter a valid email address.</FieldError>
                        )}
                    </TextField>

                    <TextField
                        fullWidth
                        name="phone"
                        type="tel"
                        value={personal.phone}
                        onChange={(v) =>
                            setPersonal((p) => ({ ...p, phone: v }))
                        }
                    >
                        <Label className={TEXT_FIELD_LABEL}>Phone number</Label>
                        <Input placeholder="+44 7700 900000" />
                    </TextField>
                </div>

                {/* Country + Timezone */}
                <div className={FORM_GRID_2COL}>
                    <ComboBox
                        selectedKey={personal.country}
                        onSelectionChange={(key: Key | null) =>
                            setPersonal((p) => ({ ...p, country: (key ?? p.country) as string }))
                        }
                        className="w-full"
                    >
                        <Label className={TEXT_FIELD_LABEL}>Country</Label>
                        <ComboBox.InputGroup>
                            <Input placeholder="Search countries..." />
                            <ComboBox.Trigger />
                        </ComboBox.InputGroup>
                        <ComboBox.Popover>
                            <ListBox>
                                {countries.map((c) => (
                                    <ListBox.Item
                                        key={c.id}
                                        id={c.id}
                                        textValue={c.name}
                                    >
                                        {c.name}
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </ComboBox.Popover>
                    </ComboBox>

                    <Select
                        selectedKey={personal.timezone}
                        onSelectionChange={(key: Key | null) =>
                            setPersonal((p) => ({ ...p, timezone: (key ?? p.timezone) as string }))
                        }
                        placeholder="Select timezone"
                        className="w-full"
                    >
                        <Label className={TEXT_FIELD_LABEL}>Timezone</Label>
                        <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator className="text-default-400 size-4" />
                        </Select.Trigger>
                        <Select.Popover>
                            <ListBox>
                                {TIMEZONES.map((tz) => (
                                    <ListBox.Item
                                        key={tz.id}
                                        id={tz.id}
                                        textValue={tz.label}
                                    >
                                        {tz.label}
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </Select.Popover>
                    </Select>
                </div>
            </FormSection>

            {/* ── Section 2: Profile ──────────────────────────────────── */}
            <FormSection
                title="Profile"
                description="Manage your availability, portfolio link, and public bio."
                isDirty={isProfileDirty}
                onCancel={handleCancel}
                onSave={handleSave}
                isSaving={isSaving}
                showActions={false}
            >
                {/* Available for projects switch */}
                <Card variant="default">
                    <Card.Content>
                        <Switch
                            isSelected={profileInfo.isAvailable}
                            onChange={(v) =>
                                setProfileInfo((p) => ({ ...p, isAvailable: v }))
                            }
                            className="w-full justify-between"
                        >
                            <Switch.Content>
                                <Label className="text-sm font-medium text-foreground">
                                    Available for projects
                                </Label>
                                <Description className="text-xs text-default-500">
                                    Show your availability to project managers.
                                </Description>
                            </Switch.Content>
                            <Switch.Control>
                                <Switch.Thumb />
                            </Switch.Control>
                        </Switch>
                    </Card.Content>
                </Card>

                {/* Portfolio URL */}
                <TextField
                    fullWidth
                    name="portfolioUrl"
                    type="url"
                    value={profileInfo.portfolioUrl}
                    onChange={(v) =>
                        setProfileInfo((p) => ({ ...p, portfolioUrl: v }))
                    }
                >
                    <Label className={TEXT_FIELD_LABEL}>Portfolio URL</Label>
                    <Input placeholder="https://yourportfolio.com" />
                </TextField>

                {/* Description with char counter */}
                <TextField
                    fullWidth
                    isInvalid={isOverLimit}
                    name="description"
                    value={profileInfo.description}
                    onChange={(v) =>
                        setProfileInfo((p) => ({ ...p, description: v }))
                    }
                >
                    <Label className={TEXT_FIELD_LABEL}>Bio</Label>
                    <TextArea
                        placeholder="Tell the team a bit about yourself…"
                        rows={4}
                    />
                    {isOverLimit ? (
                        <FieldError>
                            Bio must be {DESCRIPTION_MAX_LENGTH} characters or fewer.
                        </FieldError>
                    ) : (
                        <div className="flex justify-end">
                            <Description>
                                {charCount} / {DESCRIPTION_MAX_LENGTH}
                            </Description>
                        </div>
                    )}
                </TextField>
            </FormSection>

            {/* Shared action row for the whole tab */}
            <FormActionRow
                isDirty={isDirty}
                isSaving={isSaving}
                onCancel={handleCancel}
                onSave={handleSave}
            />
        </div>
    );
}
