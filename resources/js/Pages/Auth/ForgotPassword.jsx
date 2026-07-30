import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">
                Reset Password
            </h3>

            <div className="mb-6 text-xs text-slate-400 leading-relaxed font-semibold">
                Forgot your password? No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one.
            </div>

            {status && <div className="mb-4 text-xs font-semibold text-emerald-500">{status}</div>}

            <form onSubmit={submit} className="space-y-4">
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="block w-full bg-slate-950 border-slate-800 focus:border-emerald-500 focus:ring-emerald-500 text-white rounded-lg text-sm h-10"
                    isFocused={true}
                    onChange={(e) => setData('email', e.target.value)}
                    required
                />
                <InputError message={errors.email} className="mt-1" />

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-bold rounded-lg text-sm transition"
                    >
                        Email Password Reset Link
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}