import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-2">
                Create an Account
            </h3>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="name" value="Name" className="text-slate-400 font-semibold text-xs uppercase" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full bg-slate-950 border-slate-800 focus:border-emerald-500 focus:ring-emerald-500 text-white rounded-lg text-sm h-10"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-slate-400 font-semibold text-xs uppercase" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full bg-slate-950 border-slate-800 focus:border-emerald-500 focus:ring-emerald-500 text-white rounded-lg text-sm h-10"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-slate-400 font-semibold text-xs uppercase" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full bg-slate-950 border-slate-800 focus:border-emerald-500 focus:ring-emerald-500 text-white rounded-lg text-sm h-10"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="text-slate-400 font-semibold text-xs uppercase" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full bg-slate-950 border-slate-800 focus:border-emerald-500 focus:ring-emerald-500 text-white rounded-lg text-sm h-10"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-1" />
                </div>

                <div className="flex items-center justify-between pt-2">
                    <Link
                        href={route('login')}
                        className="text-xs text-slate-400 underline hover:text-white"
                    >
                        Already registered?
                    </Link>

                    <button
                        type="submit"
                        disabled={processing}
                        className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-bold rounded-lg text-sm transition"
                    >
                        Register
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}